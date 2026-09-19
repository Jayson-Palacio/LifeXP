'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SiteAuth from '../../components/SiteAuth'
import { updateUserPassword } from './actions'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      setIsLoading(false)
      return
    }

    const result = await updateUserPassword(password)
    setIsLoading(false)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        router.push('/apps')
      }, 2000)
    } else {
      setError(result.error || 'Failed to update password. Please try again.')
    }
  }

  return (
    <SiteAuth
      title="New password"
      subtitle="Choose a password with at least 8 characters."
    >
      {success ? (
        <p className="site-ok">Password updated. Taking you to your apps…</p>
      ) : (
        <form onSubmit={handleSubmit} className="site-form">
          <div className="input-group">
            <label htmlFor="password">New password</label>
            <input
              className="input"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              className="input"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="site-err">{error}</p>}

          <button type="submit" className="site-btn site-btn-block" disabled={isLoading}>
            {isLoading ? 'Saving…' : 'Continue'}
          </button>
        </form>
      )}
    </SiteAuth>
  )
}
