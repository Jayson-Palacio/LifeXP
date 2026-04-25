'use client'

import { useState } from 'react'
import Link from 'next/link'
import { login } from './actions'
import { createClient } from '../../utils/supabase/client'

export default function LoginPage() {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="kaeluma-bg" />
      
      <div style={{ zIndex: 1, background: 'rgba(10, 8, 20, 0.7)', backdropFilter: 'blur(16px)', padding: 'var(--space-2xl)', borderRadius: 'var(--radius-2xl)', width: '100%', maxWidth: 400, border: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: 'var(--space-xl)', background: 'linear-gradient(135deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Welcome Back
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" required />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input className="input" id="password" name="password" type="password" required />
          </div>

          {error && <p style={{ color: 'var(--red)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-xl)', color: 'var(--text-muted)' }}>
          Don't have an account? <Link href="/signup" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
