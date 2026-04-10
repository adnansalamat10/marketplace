// src/modules/payments/payments.service.ts
import {
  Injectable, BadRequestException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import Stripe from 'stripe';
import { User } from '../users/entities/user.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { Transaction, TransactionType } from './entities/transaction.entity';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(User)       private usersRepo:        Repository<User>,
    @InjectRepository(Order)      private ordersRepo:       Repository<Order>,
    @InjectRepository(Transaction) private transactionsRepo: Repository<Transaction>,
    private dataSource: DataSource,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    });
  }

  // ══════════════ STRIPE ══════════════
  async createStripeCheckout(orderId: string, buyerId: string) {
    const order = await this.ordersRepo.findOne({
      where: { id: orderId, buyerId },
      relations: ['product'],
    });
    if (!order) throw new NotFoundException('Order not found');

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: order.currency.toLowerCase(),
          product_data: { name: order.product.title },
          unit_amount: Math.round(order.amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/orders/${orderId}/success`,
      cancel_url:  `${process.env.FRONTEND_URL}/orders/${orderId}/cancel`,
      metadata: { orderId, buyerId },
    });

    return { url: session.url, sessionId: session.id };
  }

  // ── Stripe Webhook ──
  async handleStripeWebhook(payload: Buffer, signature: string) {
    const event = this.stripe.webhooks.constructEvent(
      payload, signature, process.env.STRIPE_WEBHOOK_SECRET,
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.confirmPayment(session.metadata.orderId, 'stripe', session.id);
    }
    return { received: true };
  }

  // ══════════════ PAYPAL ══════════════
  async createPaypalOrder(orderId: string) {
    const order = await this.ordersRepo.findOneOrFail({ where: { id: orderId } });

    const accessToken = await this.getPaypalAccessToken();
    const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: orderId,
          amount: { currency_code: order.currency, value: order.amount.toFixed(2) },
        }],
      }),
    });
    return response.json();
  }

  async capturePaypalOrder(paypalOrderId: string, orderId: string) {
    const accessToken = await this.getPaypalAccessToken();
    const response = await fetch(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${paypalOrderId}/capture`,
      { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const data = await response.json();
    if (data.status === 'COMPLETED') {
      await this.confirmPayment(orderId, 'paypal', paypalOrderId);
    }
    return data;
  }

  // ══════════════ WALLET ══════════════
  async topUpWallet(userId: string, amount: number) {
    if (amount < 5) throw new BadRequestException('Minimum top-up is $5');
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Wallet Top-Up' },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/wallet/success`,
      cancel_url:  `${process.env.FRONTEND_URL}/wallet`,
      metadata: { type: 'wallet_topup', userId, amount: amount.toString() },
    });
    return { url: session.url };
  }

  async payWithWallet(orderId: string, buyerId: string) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const [order, buyer] = await Promise.all([
        this.ordersRepo.findOneOrFail({ where: { id: orderId } }),
        this.usersRepo.findOneOrFail({ where: { id: buyerId } }),
      ]);

      if (buyer.walletBalance < order.amount)
        throw new BadRequestException('Insufficient wallet balance');

      // Deduct from buyer
      await qr.manager.decrement(User, { id: buyerId }, 'walletBalance', order.amount);

      // Record transaction
      const tx = qr.manager.create(Transaction, {
        userId: buyerId,
        orderId,
        amount: -order.amount,
        type: TransactionType.PURCHASE,
        description: `Payment for order #${orderId.slice(0, 8)}`,
      });
      await qr.manager.save(tx);

      // Move to escrow (hold until delivery confirmed)
      await qr.manager.update(Order, orderId, {
        status: OrderStatus.PAID,
        escrowAmount: order.amount,
        paymentMethod: 'wallet',
      });

      await qr.commitTransaction();
      return { success: true };
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  // ══════════════ ESCROW ══════════════
  async releaseEscrow(orderId: string, buyerId: string) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const order = await this.ordersRepo.findOneOrFail({ where: { id: orderId, buyerId } });
      if (order.status !== OrderStatus.DELIVERED)
        throw new BadRequestException('Order not delivered yet');

      const platformFee = order.escrowAmount * 0.05;  // 5% commission
      const sellerAmount = order.escrowAmount - platformFee;

      // Credit seller
      await qr.manager.increment(User, { id: order.sellerId }, 'walletBalance', sellerAmount);

      // Record transaction
      await qr.manager.save(Transaction, qr.manager.create(Transaction, {
        userId: order.sellerId,
        orderId,
        amount: sellerAmount,
        type: TransactionType.SALE,
        description: `Escrow released for order #${orderId.slice(0, 8)}`,
      }));

      // Complete order
      await qr.manager.update(Order, orderId, {
        status: OrderStatus.COMPLETED,
        escrowReleasedAt: new Date(),
      });

      await qr.commitTransaction();
      return { success: true, amountReleased: sellerAmount };
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  // ─── Helpers ───
  private async confirmPayment(orderId: string, method: string, externalId: string) {
    await this.ordersRepo.update(orderId, {
      status: OrderStatus.PAID,
      paymentMethod: method,
      paymentExternalId: externalId,
      paidAt: new Date(),
    });
  }

  private async getPaypalAccessToken(): Promise<string> {
    const creds = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');
    const res = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    });
    const data = await res.json();
    return data.access_token;
  }
}
