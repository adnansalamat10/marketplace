export default function Home() {
  const categories = [
    { id: 'game_currency', label: 'Game Currency', icon: '🎮', desc: 'Coins, gems & more' },
    { id: 'accounts', label: 'Accounts', icon: '👤', desc: 'Game & streaming accounts' },
    { id: 'gift_cards', label: 'Gift Cards', icon: '🎁', desc: 'Steam, PSN, Xbox & more' },
    { id: 'services', label: 'Services', icon: '⚡', desc: 'Boosting & coaching' },
    { id: 'social_media', label: 'Social Media', icon: '📱', desc: 'Followers & likes' },
  ]

  const products = [
    { id: 1, title: 'Fortnite V-Bucks 1000', price: 7.99, category: 'Game Currency', rating: 4.8, sold: 1200, delivery: 'Instant' },
    { id: 2, title: 'Netflix Premium Account', price: 12.99, category: 'Accounts', rating: 4.9, sold: 850, delivery: 'Instant' },
    { id: 3, title: 'Steam Gift Card $50', price: 49.99, category: 'Gift Cards', rating: 5.0, sold: 2300, delivery: 'Instant' },
    { id: 4, title: 'Spotify Premium 1 Month', price: 4.99, category: 'Accounts', rating: 4.7, sold: 3100, delivery: '1-2h' },
    { id: 5, title: 'League of Legends RP', price: 9.99, category: 'Game Currency', rating: 4.6, sold: 980, delivery: 'Instant' },
    { id: 6, title: 'Instagram Followers 1K', price: 5.99, category: 'Social Media', rating: 4.5, sold: 560, delivery: '24h' },
    { id: 7, title: 'PS Plus 3 Months', price: 19.99, category: 'Gift Cards', rating: 4.9, sold: 1450, delivery: 'Instant' },
    { id: 8, title: 'Valorant Points 1000', price: 8.99, category: 'Game Currency', rating: 4.8, sold: 2100, delivery: 'Instant' },
  ]

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <header style={{ background: '#111118', borderBottom: '1px solid #1a1a24', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>M</div>
            <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Marketplace</span>
          </div>
          <div style={{ flex: 1, maxWidth: '400px', margin: '0 24px' }}>
            <input placeholder="Search products..." style={{ width: '100%', background: '#1a1a24', border: '1px solid #252530', borderRadius: '12px', padding: '8px 16px', color: 'white', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <a href="/auth/login" style={{ color: '#9ca3af', textDecoration: 'none', padding: '8px 16px' }}>Login</a>
            <a href="/auth/register" style={{ background: '#2563eb', color: 'white', textDecoration: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: '600' }}>Sign Up</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg, #0d1929 0%, #0a0a0f 100%)', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '999px', padding: '6px 16px', marginBottom: '24px', fontSize: '14px', color: '#60a5fa' }}>
            🛡️ Escrow-protected marketplace
          </div>
          <h1 style={{ fontSize: '56px', fontWeight: 'bold', marginBottom: '16px', lineHeight: 1.1 }}>
            Buy & Sell <span style={{ color: '#2563eb' }}>Digital Products</span> Safely
          </h1>
          <p style={{ fontSize: '20px', color: '#6b7280', marginBottom: '32px' }}>
            Game currency, accounts, gift cards — all protected by our secure escrow system
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/products" style={{ background: '#2563eb', color: 'white', padding: '14px 32px', borderRadius: '12px', fontWeight: 'bold', textDecoration: 'none', fontSize: '16px' }}>Browse Products</a>
            <a href="/auth/register" style={{ border: '1px solid #374151', color: 'white', padding: '14px 32px', borderRadius: '12px', textDecoration: 'none', fontSize: '16px' }}>Start Selling</a>
          </div>
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginTop: '48px', flexWrap: 'wrap' }}>
            {[['120K+', 'Happy Buyers'], ['500K+', 'Secure Orders'], ['95%', 'Instant Delivery']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563eb' }}>{val}</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>Browse Categories</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {categories.map(cat => (
              <a key={cat.id} href={`/products?category=${cat.id}`} style={{ background: '#111118', border: '1px solid #1a1a24', borderRadius: '16px', padding: '24px', textAlign: 'center', textDecoration: 'none', color: 'white', transition: 'border-color 0.2s', display: 'block' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#2563eb')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1a1a24')}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{cat.icon}</div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{cat.label}</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{cat.desc}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '0 24px 60px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>⭐ Featured Products</h2>
            <a href="/products" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '14px' }}>View all →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {products.map(p => (
              <div key={p.id} style={{ background: '#111118', border: '1px solid #1a1a24', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#2563eb')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1a1a24')}>
                <div style={{ background: 'linear-gradient(135deg, #1a1a24, #252530)', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                  {p.category === 'Game Currency' ? '🎮' : p.category === 'Accounts' ? '👤' : p.category === 'Gift Cards' ? '🎁' : '📱'}
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>{p.category}</div>
                  <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px', lineHeight: 1.3 }}>{p.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <span style={{ color: '#fbbf24', fontSize: '12px' }}>★</span>
                    <span style={{ fontSize: '12px', color: '#fbbf24' }}>{p.rating}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>({p.sold} sold)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#22c55e' }}>⚡</span>
                    <span style={{ fontSize: '12px', color: '#22c55e' }}>{p.delivery}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '18px' }}>${p.price}</span>
                    <button style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Buy Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section style={{ padding: '60px 24px', background: '#111118', borderTop: '1px solid #1a1a24' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '48px' }}>Why Buy With Us?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
            {[
              { icon: '🛡️', title: 'Escrow Protection', desc: 'Your money is held safely until you confirm delivery' },
              { icon: '⚡', title: 'Instant Delivery', desc: 'Most products delivered instantly after purchase' },
              { icon: '✅', title: 'Verified Sellers', desc: 'All sellers go through KYC verification' },
              { icon: '💬', title: '24/7 Support', desc: 'Our team is always here to help you' },
            ].map(item => (
              <div key={item.title} style={{ padding: '24px', background: '#0a0a0f', borderRadius: '16px', border: '1px solid #1a1a24' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>{item.icon}</div>
                <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '16px' }}>{item.title}</div>
                <div style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#111118', borderTop: '1px solid #1a1a24', padding: '32px 24px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
        <p>© 2024 Marketplace — Buy & Sell Digital Products Safely</p>
      </footer>

    </main>
  )
}