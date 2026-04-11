'use client'
import { useState } from 'react'

const CATEGORIES = ['All', 'Game Currency', 'Accounts', 'Gift Cards', 'Services', 'Social Media']
const PRODUCTS = [
  { id: 1, title: 'Fortnite V-Bucks 1000', price: 7.99, category: 'Game Currency', rating: 4.8, sold: 1200, delivery: 'Instant', icon: '🎮' },
  { id: 2, title: 'Netflix Premium Account', price: 12.99, category: 'Accounts', rating: 4.9, sold: 850, delivery: 'Instant', icon: '👤' },
  { id: 3, title: 'Steam Gift Card $50', price: 49.99, category: 'Gift Cards', rating: 5.0, sold: 2300, delivery: 'Instant', icon: '🎁' },
  { id: 4, title: 'Spotify Premium 1 Month', price: 4.99, category: 'Accounts', rating: 4.7, sold: 3100, delivery: '1-2h', icon: '👤' },
  { id: 5, title: 'League of Legends RP', price: 9.99, category: 'Game Currency', rating: 4.6, sold: 980, delivery: 'Instant', icon: '🎮' },
  { id: 6, title: 'Instagram Followers 1K', price: 5.99, category: 'Social Media', rating: 4.5, sold: 560, delivery: '24h', icon: '📱' },
  { id: 7, title: 'PS Plus 3 Months', price: 19.99, category: 'Gift Cards', rating: 4.9, sold: 1450, delivery: 'Instant', icon: '🎁' },
  { id: 8, title: 'Valorant Points 1000', price: 8.99, category: 'Game Currency', rating: 4.8, sold: 2100, delivery: 'Instant', icon: '🎮' },
  { id: 9, title: 'YouTube Views 10K', price: 14.99, category: 'Social Media', rating: 4.4, sold: 320, delivery: '48h', icon: '📱' },
  { id: 10, title: 'Xbox Game Pass 1 Month', price: 14.99, category: 'Gift Cards', rating: 4.8, sold: 890, delivery: 'Instant', icon: '🎁' },
  { id: 11, title: 'Discord Nitro 1 Month', price: 9.99, category: 'Accounts', rating: 4.7, sold: 1200, delivery: 'Instant', icon: '👤' },
  { id: 12, title: 'TikTok Followers 500', price: 3.99, category: 'Social Media', rating: 4.3, sold: 780, delivery: '12h', icon: '📱' },
]

export default function ProductsPage() {
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('popular')

  const filtered = PRODUCTS
    .filter(p => category === 'All' || p.category === category)
    .filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : sort === 'rating' ? b.rating - a.rating : b.sold - a.sold)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ background: '#111118', borderBottom: '1px solid #1a1a24', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'white' }}>
            <div style={{ width: '32px', height: '32px', background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>M</div>
            <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Marketplace</span>
          </a>
          <div style={{ display: 'flex', gap: '12px' }}>
            <a href="/auth/login" style={{ color: '#9ca3af', textDecoration: 'none', padding: '8px 16px' }}>Login</a>
            <a href="/auth/register" style={{ background: '#2563eb', color: 'white', textDecoration: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: '600' }}>Sign Up</a>
          </div>
        </div>
      </header>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search products..."
            style={{ flex: 1, minWidth: '200px', background: '#111118', border: '1px solid #1a1a24', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none', fontSize: '14px' }} />
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ background: '#111118', border: '1px solid #1a1a24', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none', cursor: 'pointer' }}>
            <option value="popular">Most Popular</option>
            <option value="rating">Best Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              style={{ background: category === cat ? '#2563eb' : '#111118', border: `1px solid ${category === cat ? '#2563eb' : '#1a1a24'}`, borderRadius: '999px', padding: '8px 20px', color: 'white', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '14px' }}>
              {cat}
            </button>
          ))}
        </div>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>{filtered.length} products found</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {filtered.map(p => (
            <a key={p.id} href={`/products/${p.id}`} style={{ textDecoration: 'none', color: 'white' }}>
              <div style={{ background: '#111118', border: '1px solid #1a1a24', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ background: 'linear-gradient(135deg, #1a1a24, #252530)', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                  {p.icon}
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{p.category}</div>
                  <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>{p.title}</div>
                  <div style={{ color: '#fbbf24', fontSize: '12px', marginBottom: '4px' }}>★ {p.rating} ({p.sold} sold)</div>
                  <div style={{ color: '#22c55e', fontSize: '12px', marginBottom: '12px' }}>⚡ {p.delivery}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '18px' }}>${p.price}</span>
                    <button style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Buy Now</button>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}