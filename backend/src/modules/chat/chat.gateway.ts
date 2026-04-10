// src/modules/chat/chat.gateway.ts
import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@WebSocketGateway({ cors: { origin: process.env.FRONTEND_URL } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private jwtService: JwtService,
    @InjectRepository(Message) private messagesRepo: Repository<Message>,
  ) {}

  // ─── Auth on connect ───
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      this.connectedUsers.set(payload.sub, client.id);
      client.emit('connected', { userId: payload.sub });
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) this.connectedUsers.delete(userId);
  }

  // ─── Join room (order conversation) ───
  @SubscribeMessage('join_room')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    client.join(`room:${data.roomId}`);
    return { joined: data.roomId };
  }

  // ─── Send message ───
  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string; type?: string },
  ) {
    const senderId = client.data.userId;

    const message = await this.messagesRepo.save(
      this.messagesRepo.create({
        roomId: data.roomId,
        senderId,
        content: data.content,
        type: data.type || 'text',
      }),
    );

    // Broadcast to room
    this.server.to(`room:${data.roomId}`).emit('new_message', {
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      content: message.content,
      type: message.type,
      createdAt: message.createdAt,
    });

    return message;
  }

  // ─── Typing indicator ───
  @SubscribeMessage('typing')
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    client.to(`room:${data.roomId}`).emit('user_typing', { userId: client.data.userId });
  }

  // ─── Get history ───
  @SubscribeMessage('get_history')
  async getHistory(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; page?: number },
  ) {
    const messages = await this.messagesRepo.find({
      where: { roomId: data.roomId },
      order: { createdAt: 'DESC' },
      take: 50,
      skip: ((data.page || 1) - 1) * 50,
    });
    return messages.reverse();
  }

  // ─── Send notification to specific user ───
  sendNotificationToUser(userId: string, event: string, payload: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, payload);
    }
  }
}
