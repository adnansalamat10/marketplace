'use client'
import { useState } from 'react'

const CATEGORIES = [
  { id: 'games', label: 'Games', icon: '🎮', color: '#7C3AED', count: '2.4K+' },
  { id: 'gift-cards', label: 'Gift Cards', icon: '🎁', color: '#DC2626', count: '1.8K+' },
  { id: 'software', label: 'Software', icon: '💻', color: '#2563EB', count: '950+' },
  { id: 'social-media', label: 'Social Media', icon: '📱', color: '#DB2777', count: '1.2K+' },
  { id: 'accounts', label: 'Accounts', icon: '👤', color: '#059669', count: '3.1K+' },
  { id: 'crypto', label: 'Crypto', icon: '₿', color: '#D97706', count: '400+' },
]

const PRODUCTS = [
  { id: 1, title: 'Fortnite V-Bucks 13500', price: 79.99, oldPrice: 99.99, category: 'Games', rating: 4.9, reviews: 2341, sold: 12400, delivery: 'Instant', icon: '🎮', badge: 'Best Seller' },
  { id: 2, title: 'Netflix Premium 4K', price: 12.99, oldPrice: null, category: 'Accounts', rating: 4.8, reviews: 1820, sold: 8500, delivery: 'Instant', icon: '🎬', badge: 'Popular' },
  { id: 3, title: 'Steam Gift Card $50', price: 47.99, oldPrice: 50.00, category: 'Gift Cards', rating: 5.0, reviews: 4200, sold: 23000, delivery: 'Instant', icon: '🎁', badge: 'Hot' },
  { id: 4, title: 'Spotify Premium 12M', price: 9.99, oldPrice: 14.99, category: 'Accounts', rating: 4.7, reviews: 3100, sold: 31000, delivery: '1-2h', icon: '🎵', badge: 'Sale' },
  { id: 5, title: 'League of Legends RP 5000', price: 29.99, oldPrice: null, category: 'Games', rating: 4.6, reviews: 980, sold: 9800, delivery: 'Instant', icon: '⚔️', badge: null },
  { id: 6, title: 'Instagram Followers 10K', price: 14.99, oldPrice: 24.99, category: 'Social Media', rating: 4.5, reviews: 560, sold: 5600, delivery: '24h', icon: '📸', badge: 'Sale' },
  { id: 7, title: 'PS Plus Extra 12 Months', price: 59.99, oldPrice: 69.99, category: 'Gift Cards', rating: 4.9, reviews: 1450, sold: 14500, delivery: 'Instant', icon: '🕹️', badge: 'Best Seller' },
  { id: 8, title: 'Windows 11 Pro Key', price: 19.99, oldPrice: 29.99, category: 'Software', rating: 4.8, reviews: 2100, sold: 21000, delivery: 'Instant', icon: '💻', badge: 'Popular' },
]

const REVIEWS = [
  { name: 'Ahmed K.', avatar: '🧑', rating: 5, text: 'Amazing service! Got my V-Bucks instantly. Will definitely buy again!', product: 'Fortnite V-Bucks', date: '2 days ago' },
  { name: 'Sarah M.', avatar: '👩', rating: 5, text: 'Fast delivery and great prices. Best marketplace for digital products!', product: 'Netflix Premium', date: '5 days ago' },
  { name: 'Carlos R.', avatar: '🧔', rating: 4, text: 'Very reliable. The escrow system gives me confidence to buy.', product: 'Steam Gift Card', date: '1 week ago' },
]

export default function Home() {
  const [dark, setDark] = useState(true)
  const [search, setSearch] = useState('')

  const bg = dark ? '#0F172A' : '#F8FAFC'
  const card = dark ? '#1E293B' : '#FFFFFF'
  const border = dark ? '#334155' : '#E2E8F0'
  const text = dark ? '#F1F5F9' : '#0F172A'
  const muted = dark ? '#94A3B8' : '#64748B'

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: "'Inter', sans-serif", transition: 'all 0.3s' }}>

      {/* Header */}
      <header style={{ background: dark ? 'rgba(15,23,42,0.95)' : 'rgba(248,250,252,0.95)', borderBottom: `1px solid ${border}`, backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '68px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: text, flexShrink: 0 }}>
            <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', color: 'white' }}>M</div>
            <span style={{ fontWeight: '800', fontSize: '20px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MarketPro</span>
          </a>

          <div style={{ flex: 1, maxWidth: '480px', display: 'flex', alignItems: 'center', background: dark ? '#1E293B' : '#F1F5F9', border: `1px solid ${border}`, borderRadius: '12px', padding: '10px 16px', gap: '8px' }}>
            <span style={{ color: muted }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products, categories..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: text, fontSize: '14px' }} />
          </div>

          <nav style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
            <a href="/products" style={{ color: muted, textDecoration: 'none', padding: '8px 12px', fontSize: '14px', fontWeight: '500' }}>Marketplace</a>
            <a href="/support" style={{ color: muted, textDecoration: 'none', padding: '8px 12px', fontSize: '14px', fontWeight: '500' }}>Support</a>
            <button onClick={() => setDark(!dark)}
              style={{ background: dark ? '#1E293B' : '#F1F5F9', border: `1px solid ${border}`, borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', fontSize: '16px', color: text }}>
              {dark ? '☀️' : '🌙'}
            </button>
            <a href="/auth/login" style={{ color: text, textDecoration: 'none', padding: '8px 16px', fontSize: '14px', fontWeight: '500', border: `1px solid ${border}`, borderRadius: '10px' }}>Login</a>
            <a href="/auth/register" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', textDecoration: 'none', padding: '8px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600' }}>Sign Up</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: dark ? 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)' : 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 50%, #EEF2FF 100%)', padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', background: 'rgba(79,70,229,0.1)', borderRadius: '50%', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '250px', height: '250px', background: 'rgba(34,197,94,0.1)', borderRadius: '50%', filter: 'blur(60px)' }} />
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.3)', borderRadius: '999px', padding: '6px 16px', marginBottom: '28px', fontSize: '13px', color: '#818CF8' }}>
            🔒 Escrow-protected · 500K+ Transactions
          </div>
          <h1 style={{ fontSize: '64px', fontWeight: '900', lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-2px' }}>
            The #1 Digital
            <span style={{ display: 'block', background: 'linear-gradient(135deg, #4F46E5, #22C55E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Marketplace
            </span>
          </h1>
          <p style={{ fontSize: '20px', color: muted, marginBottom: '40px', lineHeight: 1.6 }}>
            Buy & sell game currency, accounts, gift cards and digital services with full escrow protection
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '60px' }}>
            <a href="/products" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', textDecoration: 'none', padding: '16px 40px', borderRadius: '14px', fontWeight: '700', fontSize: '16px', boxShadow: '0 0 30px rgba(79,70,229,0.4)' }}>
              Browse Marketplace →
            </a>
            <a href="/auth/register" style={{ background: 'transparent', color: text, textDecoration: 'none', padding: '16px 40px', borderRadius: '14px', fontWeight: '600', fontSize: '16px', border: `2px solid ${border}` }}>
              Start Selling
            </a>
          </div>
          <div style={{ display: 'flex', gap: '48px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['500K+', 'Transactions'], ['120K+', 'Happy Buyers'], ['15K+', 'Products'], ['4.9★', 'Rating']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '800', background: 'linear-gradient(135deg, #4F46E5, #22C55E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{val}</div>
                <div style={{ fontSize: '14px', color: muted }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '12px' }}>Browse Categories</h2>
            <p style={{ color: muted, fontSize: '16px' }}>Find exactly what you're looking for</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {CATEGORIES.map(cat => (
              <a key={cat.id} href={`/products?category=${cat.id}`}
                style={{ background: card, border: `1px solid ${border}`, borderRadius: '20px', padding: '28px 20px', textAlign: 'center', textDecoration: 'none', color: text, display: 'block', transition: 'transform 0.2s' }}>
                <div style={{ fontSize: '44px', marginBottom: '12px' }}>{cat.icon}</div>
                <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{cat.label}</div>
                <div style={{ fontSize: '13px', color: muted, marginBottom: '8px' }}>{cat.count} products</div>
                <div style={{ display: 'inline-block', background: cat.color + '20', color: cat.color, borderRadius: '999px', padding: '3px 12px', fontSize: '12px', fontWeight: '600' }}>
                  Browse →
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '0 24px 80px', background: dark ? '#0F172A' : '#F8FAFC' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '4px' }}>⭐ Featured Products</h2>
              <p style={{ color: muted }}>Hand-picked top deals for you</p>
            </div>
            <a href="/products" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: '600', fontSize: '14px', border: '1px solid #4F46E5', padding: '8px 20px', borderRadius: '10px' }}>View All →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {PRODUCTS.map(p => (
              <a key={p.id} href={`/products/${p.id}`} style={{ textDecoration: 'none', color: text }}>
                <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '20px', overflow: 'hidden' }}>
                  <div style={{ background: `linear-gradient(135deg, ${dark ? '#1E293B' : '#F1F5F9'}, ${dark ? '#2D3748' : '#E2E8F0'})`, height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', position: 'relative' }}>
                    {p.icon}
                    {p.badge && (
                      <div style={{ position: 'absolute', top: '12px', right: '12px', background: p.badge === 'Sale' ? '#DC2626' : p.badge === 'Hot' ? '#EA580C' : p.badge === 'Popular' ? '#7C3AED' : '#059669', color: 'white', borderRadius: '8px', padding: '3px 10px', fontSize: '11px', fontWeight: '700' }}>
                        {p.badge}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ fontSize: '12px', color: '#4F46E5', fontWeight: '600', marginBottom: '6px' }}>{p.category}</div>
                    <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '10px', lineHeight: 1.3 }}>{p.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ color: '#F59E0B' }}>{'★'.repeat(Math.floor(p.rating))}</span>
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>{p.rating}</span>
                      <span style={{ fontSize: '12px', color: muted }}>({p.reviews.toLocaleString()})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                      <span style={{ color: '#22C55E', fontSize: '12px', fontWeight: '600' }}>⚡ {p.delivery}</span>
                      <span style={{ color: muted, fontSize: '12px' }}>· {p.sold.toLocaleString()} sold</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ color: '#4F46E5', fontWeight: '800', fontSize: '22px' }}>${p.price}</span>
                        {p.oldPrice && <span style={{ color: muted, textDecoration: 'line-through', fontSize: '13px', marginLeft: '6px' }}>${p.oldPrice}</span>}
                      </div>
                      <button style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 18px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section style={{ padding: '80px 24px', background: dark ? '#1E293B' : '#F1F5F9' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '12px' }}>What Our Customers Say</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#F59E0B', fontSize: '20px' }}>
              ★★★★★ <span style={{ color: muted, fontSize: '16px', fontWeight: '600' }}>4.9/5 from 50,000+ reviews</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {REVIEWS.map((r, i) => (
              <div key={i} style={{ background: card, border: `1px solid ${border}`, borderRadius: '20px', padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{r.avatar}</div>
                  <div>
                    <div style={{ fontWeight: '700' }}>{r.name}</div>
                    <div style={{ fontSize: '12px', color: muted }}>Verified Buyer · {r.date}</div>
                  </div>
                </div>
                <div style={{ color: '#F59E0B', marginBottom: '12px', fontSize: '18px' }}>{'★'.repeat(r.rating)}</div>
                <p style={{ color: muted, lineHeight: 1.7, marginBottom: '12px' }}>"{r.text}"</p>
                <div style={{ fontSize: '12px', color: '#4F46E5', fontWeight: '600' }}>Purchased: {r.product}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ background: `linear-gradient(135deg, ${dark ? '#1E1B4B' : '#EEF2FF'}, ${dark ? '#0F2918' : '#F0FDF4'})`, borderRadius: '28px', padding: '60px 40px', textAlign: 'center', border: `1px solid ${border}` }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '48px' }}>Why Choose MarketPro?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px' }}>
              {[
                { icon: '🛡️', title: 'Escrow Protection', desc: 'Your money is held safely until delivery is confirmed', color: '#4F46E5' },
                { icon: '⚡', title: 'Instant Delivery', desc: '95% of orders delivered in under 5 minutes', color: '#22C55E' },
                { icon: '✅', title: 'Verified Sellers', desc: 'All sellers pass our strict KYC verification', color: '#7C3AED' },
                { icon: '💬', title: '24/7 Support', desc: 'Our team is always ready to help you anytime', color: '#DC2626' },
              ].map(item => (
                <div key={item.title} style={{ textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', background: item.color + '20', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px' }}>{item.icon}</div>
                  <div style={{ fontWeight: '700', fontSize: '17px', marginBottom: '8px' }}>{item.title}</div>
                  <div style={{ color: muted, fontSize: '14px', lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '16px' }}>Ready to Get Started?</h2>
          <p style={{ color: muted, fontSize: '18px', marginBottom: '40px' }}>Join 120,000+ buyers and sellers on the most trusted digital marketplace</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/auth/register" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', textDecoration: 'none', padding: '16px 40px', borderRadius: '14px', fontWeight: '700', fontSize: '16px' }}>Create Free Account</a>
            <a href="/products" style={{ border: `2px solid ${border}`, color: text, textDecoration: 'none', padding: '16px 40px', borderRadius: '14px', fontWeight: '600', fontSize: '16px' }}>Browse Products</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: dark ? '#1E293B' : '#F1F5F9', borderTop: `1px solid ${border}`, padding: '48px 24px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '40px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>M</div>
                <span style={{ fontWeight: '800', fontSize: '18px' }}>MarketPro</span>
              </div>
              <p style={{ color: muted, fontSize: '14px', lineHeight: 1.7 }}>The most trusted digital marketplace with escrow protection.</p>
            </div>
            <div>
              <div style={{ fontWeight: '700', marginBottom: '16px' }}>Marketplace</div>
              {['All Products', 'Game Currency', 'Gift Cards', 'Accounts', 'Software'].map(l => (
                <a key={l} href="/products" style={{ display: 'block', color: muted, textDecoration: 'none', fontSize: '14px', marginBottom: '8px' }}>{l}</a>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: '700', marginBottom: '16px' }}>Company</div>
              {['About Us', 'Contact', 'Blog', 'Careers'].map(l => (
                <a key={l} href="#" style={{ display: 'block', color: muted, textDecoration: 'none', fontSize: '14px', marginBottom: '8px' }}>{l}</a>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: '700', marginBottom: '16px' }}>Legal</div>
              {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Refund Policy'].map(l => (
                <a key={l} href="/terms" style={{ display: 'block', color: muted, textDecoration: 'none', fontSize: '14px', marginBottom: '8px' }}>{l}</a>
              ))}
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${border}`, paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ color: muted, fontSize: '14px' }}>© 2024 MarketPro. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              {['💳 Stripe', '🅿️ PayPal', '₿ Crypto'].map(p => (
                <span key={p} style={{ color: muted, fontSize: '13px' }}>{p}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
