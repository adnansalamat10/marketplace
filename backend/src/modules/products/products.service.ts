// src/modules/products/entities/product.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ProductCategory {
  ACCOUNTS    = 'accounts',
  GAME_CURRENCY = 'game_currency',
  GIFT_CARDS  = 'gift_cards',
  SERVICES    = 'services',
  SOCIAL_MEDIA = 'social_media',
}

export enum ProductStatus {
  ACTIVE   = 'active',
  INACTIVE = 'inactive',
  PENDING  = 'pending',
  REJECTED = 'rejected',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: ProductCategory })
  category: ProductCategory;

  @Column()
  subCategory: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.PENDING })
  status: ProductStatus;

  @Column('text', { array: true, default: '{}' })
  images: string[];

  @Column('jsonb', { default: '{}' })
  metadata: Record<string, any>;   // خصائص مخصصة لكل فئة

  @Column({ default: 0 })
  stock: number;

  @Column({ default: 0 })
  totalSold: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  totalReviews: number;

  @Column({ default: false })
  isFeatured: boolean;

  @Column('text', { array: true, default: '{}' })
  tags: string[];

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column({ nullable: true })
  deliveryTime: string;   // e.g. "instant", "1-24h"

  @ManyToOne(() => User)
  seller: User;

  @Column()
  sellerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────
// src/modules/products/products.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Product, ProductStatus } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { SearchProductsDto } from './dto/search-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productsRepo: Repository<Product>,
    private readonly esService: ElasticsearchService,
  ) {}

  // ─── Create ───
  async create(dto: CreateProductDto, sellerId: string) {
    const product = this.productsRepo.create({ ...dto, sellerId });
    const saved = await this.productsRepo.save(product);
    await this.indexProduct(saved);
    return saved;
  }

  // ─── Advanced Search & Filter ───
  async search(dto: SearchProductsDto) {
    const {
      query, category, minPrice, maxPrice,
      rating, sort = 'createdAt', order = 'DESC',
      page = 1, limit = 20,
    } = dto;

    // Full-text search via Elasticsearch
    if (query) {
      const { hits } = await this.esService.search({
        index: 'products',
        body: {
          query: {
            multi_match: {
              query,
              fields: ['title^3', 'description', 'tags^2'],
              fuzziness: 'AUTO',
            },
          },
          from: (page - 1) * limit,
          size: limit,
        },
      });
      const ids = hits.hits.map((h: any) => h._id);
      return this.productsRepo.findByIds(ids);
    }

    // DB Query Builder for filter-only
    const qb = this.productsRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.seller', 'seller')
      .where('p.status = :status', { status: ProductStatus.ACTIVE });

    if (category) qb.andWhere('p.category = :category', { category });
    if (minPrice) qb.andWhere('p.price >= :minPrice', { minPrice });
    if (maxPrice) qb.andWhere('p.price <= :maxPrice', { maxPrice });
    if (rating)   qb.andWhere('p.rating >= :rating', { rating });

    qb.orderBy(`p.${sort}`, order as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Get one ───
  async findOne(id: string) {
    const p = await this.productsRepo.findOne({
      where: { id, status: ProductStatus.ACTIVE },
      relations: ['seller'],
    });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  // ─── Update ───
  async update(id: string, dto: Partial<CreateProductDto>, sellerId: string) {
    const product = await this.productsRepo.findOneOrFail({ where: { id } });
    if (product.sellerId !== sellerId)
      throw new ForbiddenException('Not your product');
    Object.assign(product, dto);
    const updated = await this.productsRepo.save(product);
    await this.indexProduct(updated);
    return updated;
  }

  // ─── Elasticsearch Index ───
  private async indexProduct(product: Product) {
    await this.esService.index({
      index: 'products',
      id: product.id,
      body: {
        title: product.title,
        description: product.description,
        category: product.category,
        tags: product.tags,
        price: product.price,
        rating: product.rating,
      },
    });
  }
}
