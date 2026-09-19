'use client'

import { useState } from 'react'
import Link from 'next/link'
import SiteAuth from '../../components/SiteAuth'
import { login } from './actions'

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
    <SiteAuth
      title="Sign in"
      subtitle="Use your family account."
      footer={
        <p>
          Don&apos;t have an account? <Link href="/signup">Create one</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="site-form">
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            className="input"
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            autoFocus
            required
          />
        </div>

        <div className="input-group">
          <div className="site-label-row">
            <label htmlFor="password">Password</label>
            <Link href="/forgot-password">Forgot password?</Link>
          </div>
          <input
            className="input"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {error && <p className="site-err">{error}</p>}

        <button type="submit" className="site-btn site-btn-block" disabled={isLoading}>
          {isLoading ? 'Signing in…' : 'Continue'}
        </button>
      </form>
    </SiteAuth>
  )
}
