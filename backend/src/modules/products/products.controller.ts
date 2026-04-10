// src/modules/products/products.controller.ts
import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  Query, UseGuards, UseInterceptors, UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../common/guards/auth.guards';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { SearchProductsDto } from './dto/search-products.dto';
import { S3UploadService } from '../../common/services/s3-upload.service';

@ApiTags('Products')
@Controller('api/products')
export class ProductsController {
  constructor(
    private productsService: ProductsService,
    private s3: S3UploadService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Search & filter products' })
  search(@Query() dto: SearchProductsDto) {
    return this.productsService.search(dto);
  }

  @Get('featured')
  getFeatured() {
    return this.productsService.getFeatured();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('images', 5))
  async create(
    @Body() dto: CreateProductDto,
    @GetUser('id') sellerId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (files?.length) {
      dto.images = await Promise.all(files.map(f => this.s3.upload(f)));
    }
    return this.productsService.create(dto, sellerId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateProductDto>,
    @GetUser('id') sellerId: string,
  ) {
    return this.productsService.update(id, dto, sellerId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('id') sellerId: string) {
    return this.productsService.remove(id, sellerId);
  }
}

// ─────────────────────────────────────────────────────────────
// src/modules/products/dto/create-product.dto.ts
import {
  IsString, IsEnum, IsNumber, IsOptional,
  IsArray, Min, Max, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCategory } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  description: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsString()
  subCategory: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock?: number;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(90)
  @Type(() => Number)
  discountPercent?: number;

  @IsOptional()
  @IsString()
  deliveryTime?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

// ─────────────────────────────────────────────────────────────
// src/modules/products/dto/search-products.dto.ts
import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCategory } from '../entities/product.entity';

export class SearchProductsDto {
  @IsOptional() @IsString()      query?: string;
  @IsOptional() @IsEnum(ProductCategory) category?: ProductCategory;
  @IsOptional() @IsNumber() @Type(() => Number) minPrice?: number;
  @IsOptional() @IsNumber() @Type(() => Number) maxPrice?: number;
  @IsOptional() @IsNumber() @Type(() => Number) rating?: number;
  @IsOptional() @IsString()      sort?: string;
  @IsOptional() @IsString()      order?: 'ASC' | 'DESC';
  @IsOptional() @IsNumber() @Min(1) @Type(() => Number) page?: number;
  @IsOptional() @IsNumber() @Min(1) @Type(() => Number) limit?: number;
}
