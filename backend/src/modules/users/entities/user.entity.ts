// src/modules/users/entities/user.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';

export enum UserRole { BUYER = 'buyer', SELLER = 'seller', ADMIN = 'admin' }
export enum KYCStatus { PENDING = 'pending', APPROVED = 'approved', REJECTED = 'rejected' }

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, select: false })
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.BUYER })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isBanned: boolean;

  // ── 2FA ──
  @Column({ nullable: true, select: false })
  twoFactorSecret: string;

  @Column({ default: false })
  twoFactorEnabled: boolean;

  // ── OAuth ──
  @Column({ nullable: true })
  provider: string;

  @Column({ nullable: true })
  providerId: string;

  // ── KYC ──
  @Column({ type: 'enum', enum: KYCStatus, nullable: true })
  kycStatus: KYCStatus;

  @Column({ nullable: true })
  kycDocumentUrl: string;

  @Column({ nullable: true })
  kycSubmittedAt: Date;

  // ── Seller info ──
  @Column({ nullable: true })
  storeName: string;

  @Column({ nullable: true })
  storeDescription: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  walletBalance: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  totalReviews: number;

  @Column({ default: 0 })
  totalSales: number;

  @Column({ nullable: true })
  affiliateCode: string;

  @Column({ nullable: true })
  referredBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
