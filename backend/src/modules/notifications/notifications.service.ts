// src/modules/notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as sgMail from '@sendgrid/mail';
import { Notification } from './entities/notification.entity';

interface CreateNotificationDto {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sendEmail?: boolean;
  emailTemplate?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notificationsRepo: Repository<Notification>,
  ) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async create(dto: CreateNotificationDto) {
    // Save in-app notification
    const notification = await this.notificationsRepo.save(
      this.notificationsRepo.create({
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        body: dto.body,
        data: dto.data,
      }),
    );

    // Send email if requested
    if (dto.sendEmail && dto.emailTemplate) {
      await this.sendEmail(dto.userId, dto.emailTemplate, dto.data);
    }

    return notification;
  }

  async getForUser(userId: string) {
    return this.notificationsRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markRead(id: string, userId: string) {
    await this.notificationsRepo.update({ id, userId }, { isRead: true });
  }

  async markAllRead(userId: string) {
    await this.notificationsRepo.update({ userId, isRead: false }, { isRead: true });
  }

  // ── Email Templates ──
  async sendWelcomeEmail(to: string, name: string) {
    await sgMail.send({
      to,
      from: 'noreply@marketplace.com',
      templateId: process.env.SENDGRID_WELCOME_TEMPLATE,
      dynamicTemplateData: { name },
    });
  }

  async sendOrderConfirmation(to: string, order: any) {
    await sgMail.send({
      to,
      from: 'noreply@marketplace.com',
      templateId: process.env.SENDGRID_ORDER_TEMPLATE,
      dynamicTemplateData: {
        orderId: order.id.slice(0, 8).toUpperCase(),
        productName: order.product.title,
        amount: order.amount,
        currency: order.currency,
      },
    });
  }

  async sendDeliveryEmail(to: string, order: any) {
    await sgMail.send({
      to,
      from: 'noreply@marketplace.com',
      templateId: process.env.SENDGRID_DELIVERY_TEMPLATE,
      dynamicTemplateData: {
        orderId: order.id.slice(0, 8).toUpperCase(),
        deliveryData: order.deliveryData,
      },
    });
  }

  async sendDisputeEmail(to: string, dispute: any) {
    await sgMail.send({
      to,
      from: 'noreply@marketplace.com',
      subject: `Dispute Opened - Order #${dispute.orderId.slice(0, 8).toUpperCase()}`,
      html: `
        <h2>A dispute has been opened</h2>
        <p>Reason: ${dispute.reason}</p>
        <p>Our team will review and resolve within 48 hours.</p>
      `,
    });
  }

  private async sendEmail(userId: string, template: string, data?: any) {
    // Fetch user email and send
  }
}
