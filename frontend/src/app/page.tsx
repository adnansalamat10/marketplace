export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: 'white',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
      <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>
        Digital Marketplace
      </h1>
      <p style={{ fontSize: '20px', color: '#888', marginBottom: '32px' }}>
        Buy & Sell Digital Products Safely
      </p>
      <div style={{ display: 'flex', gap: '16px' }}>
        <a href="/products" style={{
          background: '#2563eb', color: 'white',
          padding: '12px 32px', borderRadius: '12px',
          textDecoration: 'none', fontWeight: 'bold'
        }}>
          Browse Products
        </a>
        <a href="/auth/register" style={{
          border: '1px solid #444', color: 'white',
          padding: '12px 32px', borderRadius: '12px',
          textDecoration: 'none'
        }}>
          Get Started
        </a>
      </div>
    </main>
  )
}