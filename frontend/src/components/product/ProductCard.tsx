// frontend/src/components/product/ProductCard.tsx
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Zap } from 'lucide-react';

interface Product {
  id: string; title: string; price: number; currency: string;
  images: string[]; rating: number; totalReviews: number;
  totalSold: number; deliveryTime: string; seller: { name: string; isVerified: boolean };
  discountPercent: number; isFeatured: boolean;
}

export function ProductCard({ product }: { product: Product }) {
  const discountedPrice = product.discountPercent > 0
    ? product.price * (1 - product.discountPercent / 100)
    : null;

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800
        hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer">

        {/* Featured Badge */}
        {product.isFeatured && (
          <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
            ⭐ Featured
          </div>
        )}

        {/* Discount Badge */}
        {product.discountPercent > 0 && (
          <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{product.discountPercent}%
          </div>
        )}

        {/* Image */}
        <div className="relative h-40 bg-gray-800 overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-blue-900/30 to-purple-900/30">
              🛒
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-sm font-medium text-white line-clamp-2 mb-1 leading-tight">
            {product.title}
          </h3>

          {/* Seller */}
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs text-gray-400">{product.seller?.name}</span>
            {product.seller?.isVerified && (
              <span className="text-blue-400" title="Verified Seller">✓</span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-500">({product.totalReviews})</span>
            <span className="text-xs text-gray-500 ml-auto">{product.totalSold} sold</span>
          </div>

          {/* Delivery time */}
          {product.deliveryTime && (
            <div className="flex items-center gap-1 mb-2">
              <Zap className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">{product.deliveryTime}</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              {discountedPrice ? (
                <>
                  <span className="text-blue-400 font-bold">
                    ${discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-gray-500 line-through text-xs ml-1">
                    ${product.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-blue-400 font-bold">${product.price.toFixed(2)}</span>
              )}
            </div>
            <button
              onClick={e => { e.preventDefault(); /* Add to cart */ }}
              className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
