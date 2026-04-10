// src/modules/auth/auth.service.ts
import {
  Injectable, UnauthorizedException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // ─────────── Register ───────────
  async register(dto: RegisterDto) {
    const exists = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = this.usersRepo.create({ ...dto, password: hashed });
    await this.usersRepo.save(user);

    return this.generateTokens(user);
  }

  // ─────────── Login ───────────
  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    // Check 2FA
    if (user.twoFactorEnabled) {
      if (!dto.twoFactorCode) {
        return { requiresTwoFactor: true };
      }
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: dto.twoFactorCode,
      });
      if (!verified) throw new UnauthorizedException('Invalid 2FA code');
    }

    return this.generateTokens(user);
  }

  // ─────────── Enable 2FA ───────────
  async enable2FA(userId: string) {
    const secret = speakeasy.generateSecret({ name: 'Marketplace' });
    await this.usersRepo.update(userId, {
      twoFactorSecret: secret.base32,
      twoFactorEnabled: false,
    });
    return { secret: secret.base32, otpauthUrl: secret.otpauth_url };
  }

  async confirm2FA(userId: string, code: string) {
    const user = await this.usersRepo.findOneOrFail({ where: { id: userId } });
    const valid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
    });
    if (!valid) throw new BadRequestException('Invalid code');
    await this.usersRepo.update(userId, { twoFactorEnabled: true });
    return { message: '2FA enabled successfully' };
  }

  // ─────────── OAuth (Google / Facebook) ───────────
  async oauthLogin(oauthUser: {
    email: string; name: string; avatar?: string; provider: string; providerId: string;
  }) {
    let user = await this.usersRepo.findOne({ where: { email: oauthUser.email } });
    if (!user) {
      user = this.usersRepo.create({
        email: oauthUser.email,
        name: oauthUser.name,
        avatar: oauthUser.avatar,
        provider: oauthUser.provider,
        providerId: oauthUser.providerId,
        isVerified: true,
      });
      await this.usersRepo.save(user);
    }
    return this.generateTokens(user);
  }

  // ─────────── Refresh Token ───────────
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const user = await this.usersRepo.findOneOrFail({ where: { id: payload.sub } });
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // ─────────── Helpers ───────────
  private generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
      user: {
        id: user.id, email: user.email, name: user.name,
        role: user.role, avatar: user.avatar,
      },
    };
  }
}
