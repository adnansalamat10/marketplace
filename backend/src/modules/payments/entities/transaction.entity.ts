// src/modules/payments/entities/transaction.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum TransactionType {
  PURCHASE = 'purchase',
  SALE     = 'sale',
  TOPUP    = 'topup',
  REFUND   = 'refund',
  AFFILIATE = 'affiliate',
  WITHDRAWAL = 'withdrawal',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  orderId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}

// ─────────────────────────────────────────────────────────────
// src/modules/users/affiliate.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Transaction, TransactionType } from '../payments/entities/transaction.entity';
import { nanoid } from 'nanoid';

@Injectable()
export class AffiliateService {
  constructor(
    @InjectRepository(User)        private usersRepo:        Repository<User>,
    @InjectRepository(Transaction) private transactionsRepo: Repository<Transaction>,
  ) {}

  // Generate unique affiliate code for new sellers
  async generateAffiliateCode(userId: string): Promise<string> {
    const code = nanoid(8).toUpperCase();
    await this.usersRepo.update(userId, { affiliateCode: code });
    return code;
  }

  // Apply affiliate code on registration
  async applyReferral(newUserId: string, affiliateCode: string) {
    const referrer = await this.usersRepo.findOne({ where: { affiliateCode } });
    if (!referrer) return;
    await this.usersRepo.update(newUserId, { referredBy: referrer.id });
  }

  // Pay affiliate commission on completed order (2%)
  async payAffiliateCommission(order: { buyerId: string; amount: number }) {
    const buyer = await this.usersRepo.findOne({ where: { id: order.buyerId } });
    if (!buyer?.referredBy) return;

    const commission = order.amount * 0.02;
    await this.usersRepo.increment({ id: buyer.referredBy }, 'walletBalance', commission);
    await this.transactionsRepo.save(
      this.transactionsRepo.create({
        userId: buyer.referredBy,
        amount: commission,
        type: TransactionType.AFFILIATE,
        description: `Affiliate commission for referral`,
      }),
    );
  }

  // Get affiliate stats
  async getStats(userId: string) {
    const referrals = await this.usersRepo.count({ where: { referredBy: userId } });
    const earnings = await this.transactionsRepo
      .createQueryBuilder('t')
      .select('SUM(t.amount)', 'total')
      .where('t.userId = :userId AND t.type = :type', {
        userId, type: TransactionType.AFFILIATE,
      })
      .getRawOne();

    return {
      referralCode: (await this.usersRepo.findOne({ where: { id: userId } }))?.affiliateCode,
      totalReferrals: referrals,
      totalEarnings: parseFloat(earnings?.total || '0'),
      referralLink: `${process.env.FRONTEND_URL}/ref/${userId}`,
    };
  }
}
