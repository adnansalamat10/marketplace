// frontend/src/app/page.tsx
import Link from 'next/link';
import { Search, Shield, Zap, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';
import { Header } from '@/components/layout/Header';

async function getFeaturedProducts() {
  try {
    return await api.get('/api/products/featured') as any[];
  } catch { return []; }
}

const CATEGORIES = [
  { id: 'accounts',      label: 'Accounts',       icon: '👤', desc: 'Game, streaming & social accounts' },
  { id: 'game_currency', label: 'Game Currency',  icon: '🎮', desc: 'Coins, gems, V-Bucks & more' },
  { id: 'gift_cards',    label: 'Gift Cards',     icon: '🎁', desc: 'Steam, PlayStation, Xbox & more' },
  { id: 'services',      label: 'Services',       icon: '⚡', desc: 'Boosting, coaching, customization' },
  { id: 'social_media',  label: 'Social Media',   icon: '📱', desc: 'Followers, likes, views & more' },
];

const STATS = [
  { label: 'Happy Buyers',   value: '120K+',  icon: Users },
  { label: 'Secure Orders',  value: '500K+',  icon: Shield },
  { label: 'Instant Delivery', value: '95%',  icon: Zap },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950 text-white">

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-950/30 to-gray-950 py-20 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm px-4 py-1.5 rounded-full mb-6">
              <Shield className="w-3.5 h-3.5" /> Escrow-protected marketplace
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Buy & Sell{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Digital Products
              </span>
              {' '}Safely
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Game currency, accounts, gift cards, and digital services — all protected by our secure escrow system.
            </p>

            {/* Search */}
            <form action="/products" className="flex gap-3 max-w-xl mx-auto mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  name="q"
                  type="text"
                  placeholder="Search for products..."
                  className="w-full bg-gray-800 text-white pl-12 pr-4 py-4 rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 border border-gray-700"
                />
              </div>
              <button type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-xl font-medium transition-all shrink-0">
                Search
              </button>
            </form>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8">
              {STATS.map(s => (
                <div key={s.label} className="flex items-center gap-2 text-sm text-gray-400">
                  <s.icon className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white">{s.value}</span>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">Browse Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map(cat => (
              <Link key={cat.id} href={`/products?category=${cat.id}`}
                className="group bg-gray-900 rounded-2xl p-5 border border-gray-800
                  hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all text-center">
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h3 className="font-semibold mb-1 group-hover:text-blue-400 transition-colors">{cat.label}</h3>
                <p className="text-xs text-gray-500 leading-tight">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        {featured.length > 0 && (
          <section className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">⭐ Featured Products</h2>
              <Link href="/products?sort=isFeatured-DESC" className="text-blue-400 hover:text-blue-300 text-sm">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {featured.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Trust Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="bg-gradient-to-r from-blue-950/40 to-purple-950/40 rounded-3xl border border-gray-800 p-10 text-center">
            <h2 className="text-3xl font-bold mb-4">Why Buy With Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">Escrow Protection</h3>
                <p className="text-gray-400 text-sm">Your money is held safely until you confirm delivery. We never release funds until you're satisfied.</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">Instant Delivery</h3>
                <p className="text-gray-400 text-sm">Most products are delivered instantly or within a few hours of your purchase.</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">Verified Sellers</h3>
                <p className="text-gray-400 text-sm">All sellers go through our KYC verification process and have real reviews from buyers.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
