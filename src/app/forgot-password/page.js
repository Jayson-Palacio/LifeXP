'use client'

import { useState } from 'react'
import Link from 'next/link'
import { requestPasswordReset } from './actions'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const result = await requestPasswordReset(email)
    setIsLoading(false)

    if (result.success) {
      setSuccess(true)
      setEmail('')
    } else {
      setError(result.error || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="kaeluma-bg" />
      
      <div style={{ zIndex: 1, background: 'rgba(10, 8, 20, 0.7)', backdropFilter: 'blur(16px)', padding: 'var(--space-2xl)', borderRadius: 'var(--radius-2xl)', width: '100%', maxWidth: 400, border: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: 'var(--space-md)', background: 'linear-gradient(135deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Reset Password
        </h1>
        
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 'var(--space-xl)', fontSize: '0.95rem', lineHeight: '1.5' }}>
          Enter your email address and we'll send you a magic link to reset your password.
        </p>

        {success ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', textAlign: 'center' }}>
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--green)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ color: 'var(--green)', fontSize: '0.95rem', fontWeight: '500', margin: 0 }}>
                Check your inbox! We've sent a password reset link to your email.
              </p>
            </div>
            
            <Link href="/login" className="btn btn-primary btn-block btn-lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              Back to Log in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input 
                className="input" 
                id="email" 
                name="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required 
              />
            </div>

            {error && <p style={{ color: 'var(--red)', fontSize: '0.9rem', textAlign: 'center', margin: 0 }}>{error}</p>}

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={isLoading}>
              {isLoading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
            
            <p style={{ textAlign: 'center', marginTop: 'var(--space-md)', marginBottom: 0 }}>
              <Link href="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', hover: { color: 'var(--primary)' } }}>
                Back to Log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
