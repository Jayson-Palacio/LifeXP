'use client'

import { useState } from 'react'
import { updatePassword } from '../login/actions'

export default function UpdatePasswordPage() {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password')
    const confirmPassword = formData.get('confirm_password')

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    const result = await updatePassword(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="kaeluma-bg" />
      
      <div style={{ zIndex: 1, background: 'rgba(10, 8, 20, 0.7)', backdropFilter: 'blur(16px)', padding: 'var(--space-2xl)', borderRadius: 'var(--radius-2xl)', width: '100%', maxWidth: 400, border: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: 'var(--space-md)', background: 'linear-gradient(135deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          New Password
        </h1>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 'var(--space-xl)' }}>
          Enter your new password below.
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div className="input-group">
            <label htmlFor="password">New Password</label>
            <input className="input" id="password" name="password" type="password" required minLength={6} />
          </div>

          <div className="input-group">
            <label htmlFor="confirm_password">Confirm New Password</label>
            <input className="input" id="confirm_password" name="confirm_password" type="password" required minLength={6} />
          </div>

          {error && <p style={{ color: 'var(--red)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
