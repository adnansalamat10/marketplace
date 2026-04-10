// src/modules/orders/entities/order.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

export enum OrderStatus {
  PENDING   = 'pending',
  PAID      = 'paid',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  DISPUTED  = 'disputed',
  REFUNDED  = 'refunded',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  buyerId: string;

  @Column()
  sellerId: string;

  @Column()
  productId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  paymentExternalId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  escrowAmount: number;

  @Column({ nullable: true })
  escrowReleasedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  deliveryData: Record<string, any>;

  @Column({ default: false })
  buyerConfirmed: boolean;

  @Column({ nullable: true })
  disputeId: string;

  @Column({ nullable: true })
  paidAt: Date;

  @ManyToOne(() => User)
  buyer: User;

  @ManyToOne(() => User)
  seller: User;

  @ManyToOne(() => Product)
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
