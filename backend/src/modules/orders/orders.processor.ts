// src/modules/orders/orders.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { PaymentsService } from '../payments/payments.service';

@Processor('orders')
export class OrdersProcessor {
  constructor(
    @InjectRepository(Order) private ordersRepo: Repository<Order>,
    private paymentsService: PaymentsService,
  ) {}

  // Auto-complete order if buyer doesn't confirm within 3 days
  @Process('auto-complete')
  async handleAutoComplete(job: Job<{ orderId: string; buyerId: string }>) {
    const { orderId, buyerId } = job.data;
    const order = await this.ordersRepo.findOne({ where: { id: orderId } });

    if (!order || order.status !== OrderStatus.DELIVERED) return;

    // Auto-confirm and release escrow
    await this.ordersRepo.update(orderId, {
      status: OrderStatus.COMPLETED,
      buyerConfirmed: true,
    });
    await this.paymentsService.releaseEscrow(orderId, buyerId);
    console.log(`[Queue] Auto-completed order ${orderId}`);
  }
}

// ─────────────────────────────────────────────────────────────
// src/modules/orders/orders.service.ts (add to markDelivered)
// After marking delivered, schedule auto-complete in 3 days:
//
// import { InjectQueue } from '@nestjs/bull';
// import { Queue } from 'bull';
//
// constructor(... @InjectQueue('orders') private ordersQueue: Queue) {}
//
// await this.ordersQueue.add('auto-complete',
//   { orderId, buyerId: order.buyerId },
//   { delay: 3 * 24 * 60 * 60 * 1000 }  // 3 days
// );

// ─────────────────────────────────────────────────────────────
// src/modules/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersProcessor } from './orders.processor';
import { Order } from './entities/order.entity';
import { Dispute } from './entities/dispute.entity';
import { Review } from './entities/review.entity';
import { Product } from '../products/entities/product.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Dispute, Review, Product]),
    BullModule.registerQueue({ name: 'orders' }),
    NotificationsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersProcessor],
  exports: [OrdersService],
})
export class OrdersModule {}
