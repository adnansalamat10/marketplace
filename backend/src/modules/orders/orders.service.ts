// src/modules/orders/orders.service.ts
import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Product, ProductStatus } from '../products/entities/product.entity';
import { Dispute } from './entities/dispute.entity';
import { Review } from './entities/review.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)   private ordersRepo:   Repository<Order>,
    @InjectRepository(Product) private productsRepo: Repository<Product>,
    @InjectRepository(Dispute) private disputesRepo: Repository<Dispute>,
    @InjectRepository(Review)  private reviewsRepo:  Repository<Review>,
    private notificationsService: NotificationsService,
  ) {}

  // ── Create Order ──
  async create(dto: CreateOrderDto, buyerId: string) {
    const product = await this.productsRepo.findOne({
      where: { id: dto.productId, status: ProductStatus.ACTIVE },
    });
    if (!product) throw new NotFoundException('Product not found or unavailable');
    if (product.stock < 1) throw new BadRequestException('Product out of stock');
    if (product.sellerId === buyerId) throw new BadRequestException('Cannot buy your own product');

    const order = this.ordersRepo.create({
      buyerId,
      sellerId: product.sellerId,
      productId: product.id,
      amount: product.price,
      currency: product.currency,
    });
    const saved = await this.ordersRepo.save(order);

    // Notify seller
    await this.notificationsService.create({
      userId: product.sellerId,
      type: 'new_order',
      title: 'New Order Received',
      body: `You have a new order for "${product.title}"`,
      data: { orderId: saved.id },
    });

    return saved;
  }

  // ── Get buyer orders ──
  async getBuyerOrders(buyerId: string, page = 1, limit = 20) {
    const [items, total] = await this.ordersRepo.findAndCount({
      where: { buyerId },
      relations: ['product', 'seller'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  // ── Get seller orders ──
  async getSellerOrders(sellerId: string, page = 1, limit = 20) {
    const [items, total] = await this.ordersRepo.findAndCount({
      where: { sellerId },
      relations: ['product', 'buyer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  // ── Mark as Delivered (seller) ──
  async markDelivered(orderId: string, sellerId: string, deliveryData: any) {
    const order = await this.ordersRepo.findOneOrFail({ where: { id: orderId, sellerId } });
    if (order.status !== OrderStatus.PAID)
      throw new BadRequestException('Order must be paid first');

    await this.ordersRepo.update(orderId, {
      status: OrderStatus.DELIVERED,
      deliveryData,
    });

    await this.notificationsService.create({
      userId: order.buyerId,
      type: 'order_delivered',
      title: 'Order Delivered',
      body: 'Your order has been delivered. Please confirm receipt.',
      data: { orderId },
    });

    // Auto-complete after 3 days if buyer doesn't confirm
    // (handled by a Bull queue job)
    return { success: true };
  }

  // ── Confirm Receipt (buyer) ──
  async confirmReceipt(orderId: string, buyerId: string) {
    const order = await this.ordersRepo.findOneOrFail({ where: { id: orderId, buyerId } });
    if (order.status !== OrderStatus.DELIVERED)
      throw new BadRequestException('Order not delivered yet');

    await this.ordersRepo.update(orderId, {
      status: OrderStatus.COMPLETED,
      buyerConfirmed: true,
    });

    return { success: true, message: 'Receipt confirmed. Escrow will be released.' };
  }

  // ── Open Dispute ──
  async openDispute(orderId: string, userId: string, reason: string) {
    const order = await this.ordersRepo.findOneOrFail({ where: { id: orderId } });
    if (order.buyerId !== userId && order.sellerId !== userId)
      throw new ForbiddenException('Not part of this order');
    if (![OrderStatus.PAID, OrderStatus.DELIVERED].includes(order.status))
      throw new BadRequestException('Cannot dispute this order');
    if (order.disputeId)
      throw new BadRequestException('Dispute already exists for this order');

    const dispute = await this.disputesRepo.save(
      this.disputesRepo.create({ orderId, openedBy: userId, reason }),
    );
    await this.ordersRepo.update(orderId, {
      status: OrderStatus.DISPUTED,
      disputeId: dispute.id,
    });

    return dispute;
  }

  // ── Leave Review ──
  async leaveReview(orderId: string, reviewerId: string, rating: number, comment: string) {
    const order = await this.ordersRepo.findOneOrFail({
      where: { id: orderId, buyerId: reviewerId, status: OrderStatus.COMPLETED },
    });

    const existing = await this.reviewsRepo.findOne({ where: { orderId } });
    if (existing) throw new BadRequestException('Already reviewed this order');

    const review = await this.reviewsRepo.save(
      this.reviewsRepo.create({
        orderId,
        reviewerId,
        productId: order.productId,
        sellerId: order.sellerId,
        rating,
        comment,
      }),
    );

    // Update product & seller average rating
    await this.updateRatings(order.productId, order.sellerId);
    return review;
  }

  private async updateRatings(productId: string, sellerId: string) {
    // Product rating
    const productAvg = await this.reviewsRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('r.productId = :productId', { productId })
      .getRawOne();

    await this.productsRepo.update(productId, {
      rating: parseFloat(productAvg.avg) || 0,
      totalReviews: parseInt(productAvg.count) || 0,
    });

    // Seller rating
    const sellerAvg = await this.reviewsRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('r.sellerId = :sellerId', { sellerId })
      .getRawOne();

    // (update user rating via UsersRepository injected separately)
  }
}
