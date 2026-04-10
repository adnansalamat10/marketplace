// frontend/src/app/products/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star, Shield, Zap, MessageCircle, Flag,
  ChevronLeft, ChevronRight, Clock,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore, useCartStore } from '@/store';
import { LiveChat } from '@/components/chat/LiveChat';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { add: addToCart } = useCartStore();

  const [product, setProduct]       = useState<any>(null);
  const [reviews, setReviews]       = useState<any[]>([]);
  const [imgIndex, setImgIndex]     = useState(0);
  const [chatOpen, setChatOpen]     = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/api/products/${id}`),
      api.get(`/api/products/${id}/reviews`),
    ]).then(([p, r]: any) => { setProduct(p); setReviews(r); });
  }, [id]);

  const handleBuyNow = async () => {
    if (!user) { router.push('/auth/login'); return; }
    setBuyLoading(true);
    try {
      const order: any = await api.post('/api/orders', { productId: id });
      router.push(`/checkout/${order.id}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create order');
    } finally {
      setBuyLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0],
      sellerId: product.sellerId,
      sellerName: product.seller?.name,
    });
    toast.success('Added to cart!');
  };

  if (!product) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const discountedPrice = product.discountPercent > 0
    ? product.price * (1 - product.discountPercent / 100)
    : null;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-white">Home</Link> /
          <Link href="/products" className="hover:text-white">Products</Link> /
          <Link href={`/products?category=${product.category}`} className="hover:text-white capitalize">
            {product.category?.replace('_', ' ')}
          </Link> /
          <span className="text-gray-300 line-clamp-1">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Images + Description */}
          <div className="lg:col-span-2 space-y-6">

            {/* Image Gallery */}
            {product.images?.length > 0 && (
              <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
                <div className="relative h-72 md:h-96">
                  <Image src={product.images[imgIndex]} alt={product.title} fill className="object-contain p-4" />
                  {product.images.length > 1 && (
                    <>
                      <button onClick={() => setImgIndex(i => (i - 1 + product.images.length) % product.images.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/70">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={() => setImgIndex(i => (i + 1) % product.images.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/70">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
                {product.images.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {product.images.map((img: string, i: number) => (
                      <button key={i} onClick={() => setImgIndex(i)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all
                          ${i === imgIndex ? 'border-blue-500' : 'border-gray-700'}`}>
                        <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="font-semibold text-lg mb-4">Product Description</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{product.description}</p>

              {/* Metadata */}
              {product.metadata && Object.keys(product.metadata).length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="font-medium mb-3">Details</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(product.metadata).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm py-2 border-b border-gray-800">
                        <span className="text-gray-400 capitalize">{k.replace(/_/g, ' ')}</span>
                        <span className="text-white">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-lg">
                  Reviews ({product.totalReviews})
                </h2>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-5 h-5 ${s <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                  ))}
                  <span className="ml-1 font-bold">{product.rating.toFixed(1)}</span>
                </div>
              </div>
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r: any) => (
                    <div key={r.id} className="border-b border-gray-800 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center text-sm">
                            {r.reviewer?.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium text-sm">{r.reviewer?.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{r.comment}</p>
                      <p className="text-gray-600 text-xs mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Purchase Card */}
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 sticky top-20">
              <h1 className="text-xl font-bold mb-3 leading-tight">{product.title}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-400">{product.rating.toFixed(1)} ({product.totalReviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-4">
                {discountedPrice ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-blue-400">${discountedPrice.toFixed(2)}</span>
                    <span className="text-gray-500 line-through">${product.price.toFixed(2)}</span>
                    <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">
                      -{product.discountPercent}%
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-blue-400">${product.price.toFixed(2)}</span>
                )}
              </div>

              {/* Info */}
              <div className="space-y-2 mb-5 text-sm">
                {product.deliveryTime && (
                  <div className="flex items-center gap-2 text-green-400">
                    <Zap className="w-4 h-4" />
                    <span>Delivery: {product.deliveryTime}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{product.totalSold} sold</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <Shield className="w-4 h-4" />
                  <span>Escrow protected</span>
                </div>
              </div>

              {/* Seller */}
              <Link href={`/sellers/${product.sellerId}`}
                className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl mb-5 hover:bg-gray-700 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                  {product.seller?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm">{product.seller?.name}</p>
                  <p className="text-xs text-gray-400">
                    ⭐ {product.seller?.rating?.toFixed(1)} · {product.seller?.totalSales} sales
                  </p>
                </div>
              </Link>

              {/* Actions */}
              <div className="space-y-3">
                <button onClick={handleBuyNow} disabled={buyLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all">
                  {buyLoading ? 'Processing...' : 'Buy Now'}
                </button>
                <button onClick={handleAddToCart}
                  className="w-full border border-gray-600 hover:border-gray-500 text-gray-300 py-3 rounded-xl transition-all text-sm">
                  Add to Cart
                </button>
                {user && user.id !== product.sellerId && (
                  <button onClick={() => setChatOpen(true)}
                    className="w-full flex items-center justify-center gap-2 border border-gray-600 hover:border-blue-500 text-gray-300 hover:text-blue-400 py-3 rounded-xl transition-all text-sm">
                    <MessageCircle className="w-4 h-4" /> Chat with Seller
                  </button>
                )}
              </div>

              <button className="w-full flex items-center justify-center gap-2 mt-3 text-xs text-gray-600 hover:text-gray-400 transition-colors">
                <Flag className="w-3 h-3" /> Report this listing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Chat */}
      {chatOpen && (
        <LiveChat
          roomId={`product-${product.id}-user-${user?.id}`}
          otherUser={{ id: product.sellerId, name: product.seller?.name }}
          onClose={() => setChatOpen(false)}
        />
      )}
    </main>
  );
}
