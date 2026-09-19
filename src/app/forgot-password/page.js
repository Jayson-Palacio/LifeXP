'use client'

import { useState } from 'react'
import Link from 'next/link'
import SiteAuth from '../../components/SiteAuth'
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
    <SiteAuth
      title="Reset password"
      subtitle="We’ll email a link if that account exists."
      footer={
        <p>
          <Link href="/login">Back to sign in</Link>
        </p>
      }
    >
      {success ? (
        <p className="site-ok">Check your inbox for a reset link.</p>
      ) : (
        <form onSubmit={handleSubmit} className="site-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              className="input"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && <p className="site-err">{error}</p>}

          <button type="submit" className="site-btn site-btn-block" disabled={isLoading}>
            {isLoading ? 'Sending…' : 'Continue'}
          </button>
        </form>
      )}
    </SiteAuth>
  )
}
