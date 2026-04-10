// src/modules/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User, KYCStatus } from '../users/entities/user.entity';
import { Product, ProductStatus } from '../products/entities/product.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { Dispute } from '../orders/entities/dispute.entity';
import { Transaction } from '../payments/entities/transaction.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)        private usersRepo:        Repository<User>,
    @InjectRepository(Product)     private productsRepo:     Repository<Product>,
    @InjectRepository(Order)       private ordersRepo:       Repository<Order>,
    @InjectRepository(Dispute)     private disputesRepo:     Repository<Dispute>,
    @InjectRepository(Transaction) private transactionsRepo: Repository<Transaction>,
  ) {}

  // ── Dashboard Analytics ──
  async getAnalytics() {
    const [
      totalUsers, totalSellers, totalProducts,
      totalOrders, totalRevenue, pendingKYC,
      openDisputes,
    ] = await Promise.all([
      this.usersRepo.count(),
      this.usersRepo.count({ where: { role: 'seller' as any } }),
      this.productsRepo.count({ where: { status: ProductStatus.ACTIVE } }),
      this.ordersRepo.count(),
      this.ordersRepo
        .createQueryBuilder('o')
        .select('SUM(o.amount * 0.05)', 'revenue')  // 5% platform fee
        .where('o.status = :s', { s: OrderStatus.COMPLETED })
        .getRawOne(),
      this.usersRepo.count({ where: { kycStatus: KYCStatus.PENDING } }),
      this.disputesRepo.count({ where: { status: 'open' as any } }),
    ]);

    return {
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      totalRevenue: parseFloat(totalRevenue?.revenue || '0'),
      pendingKYC,
      openDisputes,
    };
  }

  // ── Revenue Chart (last 30 days) ──
  async getRevenueChart() {
    const data = await this.ordersRepo
      .createQueryBuilder('o')
      .select("DATE_TRUNC('day', o.paidAt)", 'date')
      .addSelect('SUM(o.amount)', 'volume')
      .addSelect('SUM(o.amount * 0.05)', 'revenue')
      .addSelect('COUNT(*)', 'orders')
      .where('o.status = :s', { s: OrderStatus.COMPLETED })
      .andWhere('o.paidAt >= :from', { from: new Date(Date.now() - 30 * 86400000) })
      .groupBy("DATE_TRUNC('day', o.paidAt)")
      .orderBy('date', 'ASC')
      .getRawMany();

    return data;
  }

  // ── Users ──
  async getUsers(page = 1, limit = 20, search?: string) {
    const qb = this.usersRepo.createQueryBuilder('u')
      .orderBy('u.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.where('u.email ILIKE :s OR u.name ILIKE :s', { s: `%${search}%` });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async banUser(userId: string, banned: boolean) {
    await this.usersRepo.update(userId, { isBanned: banned });
    return { success: true };
  }

  // ── KYC ──
  async getPendingKYC() {
    return this.usersRepo.find({
      where: { kycStatus: KYCStatus.PENDING },
      order: { kycSubmittedAt: 'ASC' },
    });
  }

  async reviewKYC(userId: string, approved: boolean) {
    await this.usersRepo.update(userId, {
      kycStatus: approved ? KYCStatus.APPROVED : KYCStatus.REJECTED,
      role: approved ? 'seller' as any : undefined,
    });
    return { success: true };
  }

  // ── Products ──
  async getPendingProducts() {
    return this.productsRepo.find({
      where: { status: ProductStatus.PENDING },
      relations: ['seller'],
      order: { createdAt: 'ASC' },
    });
  }

  async approveProduct(productId: string, approved: boolean) {
    await this.productsRepo.update(productId, {
      status: approved ? ProductStatus.ACTIVE : ProductStatus.REJECTED,
    });
    return { success: true };
  }

  // ── Disputes ──
  async getDisputes(status?: string) {
    const qb = this.disputesRepo.createQueryBuilder('d')
      .leftJoinAndSelect('d.order', 'order')
      .orderBy('d.createdAt', 'DESC');
    if (status) qb.where('d.status = :status', { status });
    return qb.getMany();
  }

  async resolveDispute(disputeId: string, adminId: string, resolution: string, refundBuyer: boolean) {
    await this.disputesRepo.update(disputeId, {
      status: 'resolved' as any,
      resolution,
      resolvedBy: adminId,
    });

    const dispute = await this.disputesRepo.findOneOrFail({
      where: { id: disputeId },
      relations: ['order'],
    });

    // Refund buyer or release to seller
    if (refundBuyer) {
      await this.usersRepo.increment(
        { id: dispute.order.buyerId },
        'walletBalance',
        dispute.order.escrowAmount,
      );
      await this.ordersRepo.update(dispute.orderId, { status: OrderStatus.REFUNDED });
    } else {
      await this.usersRepo.increment(
        { id: dispute.order.sellerId },
        'walletBalance',
        dispute.order.escrowAmount * 0.95,
      );
      await this.ordersRepo.update(dispute.orderId, { status: OrderStatus.COMPLETED });
    }

    return { success: true };
  }
}
