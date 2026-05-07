'use client'

import { useState } from 'react'
import Link from 'next/link'
import { resetPassword } from '../login/actions'

export default function ForgotPasswordPage() {
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result = await resetPassword(formData)
    
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(true)
    }
    
    setIsLoading(false)
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="kaeluma-bg" />
      
      <div style={{ zIndex: 1, background: 'rgba(10, 8, 20, 0.7)', backdropFilter: 'blur(16px)', padding: 'var(--space-2xl)', borderRadius: 'var(--radius-2xl)', width: '100%', maxWidth: 400, border: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: 'var(--space-md)', background: 'linear-gradient(135deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Reset Password
        </h1>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
            <p style={{ color: 'var(--text-bright)', marginBottom: '1rem', fontSize: '1.1rem' }}>
              Check your email!
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              We sent you a link to reset your password. It may take a few minutes to arrive.
            </p>
            <Link href="/login" className="btn btn-ghost btn-block">
              Return to login
            </Link>
          </div>
        ) : (
          <>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 'var(--space-xl)' }}>
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input className="input" id="email" name="email" type="email" required />
              </div>

              {error && <p style={{ color: 'var(--red)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 'var(--space-xl)', color: 'var(--text-muted)' }}>
              Remember your password? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Log in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
