'use client'
import { useState } from 'react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'white', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', background: '#2563eb', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>M</div>
            <span style={{ fontWeight: 'bold', fontSize: '20px' }}>Marketplace</span>
          </a>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Create account</h1>
          <p style={{ color: '#6b7280' }}>Join thousands of buyers and sellers</p>
        </div>

        <div style={{ background: '#111118', border: '1px solid #1a1a24', borderRadius: '20px', padding: '32px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="John Doe"
              style={{ width: '100%', background: '#1a1a24', border: '1px solid #252530', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none', boxSizing: 'border-box', fontSize: '14px' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', background: '#1a1a24', border: '1px solid #252530', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none', boxSizing: 'border-box', fontSize: '14px' }} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              style={{ width: '100%', background: '#1a1a24', border: '1px solid #252530', borderRadius: '12px', padding: '12px 16px', color: 'white', outline: 'none', boxSizing: 'border-box', fontSize: '14px' }} />
          </div>

          <button style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginBottom: '16px' }}>
            Create Account
          </button>

          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
            By signing up you agree to our <a href="#" style={{ color: '#2563eb', textDecoration: 'none' }}>Terms</a> and <a href="#" style={{ color: '#2563eb', textDecoration: 'none' }}>Privacy Policy</a>
          </p>

          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginTop: '16px' }}>
            Already have an account?{' '}
            <a href="/auth/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  )
}