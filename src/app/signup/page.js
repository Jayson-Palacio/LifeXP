'use client'

import { useState } from 'react'
import Link from 'next/link'
import SiteAuth from '../../components/SiteAuth'
import { signup } from '../login/actions'

const BLOCKED_DOMAINS = new Set([
  'mailinator.com','guerrillamail.com','tempmail.com','throwaway.email',
  'yopmail.com','sharklasers.com','spam4.me','trashmail.com','trashmail.me',
  'trashmail.at','trashmail.io','trashmail.net','fakeinbox.com','maildrop.cc',
  'dispostable.com','spamgourmet.com','mintemail.com','tempr.email',
  'discard.email','mailnesia.com','binkmail.com','bob.email','getnada.com',
  'moakt.com','throwam.com','tmpmail.net','tmpmail.org','discardmail.com',
]);

const FAKE_PATTERNS = [
  /^test\d*$/i, /^fake\d*$/i, /^asdf/i, /^qwer/i, /^zxcv/i,
  /^aaa+$/i, /^123/i, /^abc\d*$/i, /^noreply/i, /^no-reply/i,
  /^example/i, /^sample/i, /^dummy/i,
];

function validateEmail(email) {
  const lower = email.toLowerCase();
  const atIdx = lower.indexOf('@');
  if (atIdx < 1) return 'Please enter a valid email address.';
  const local = lower.slice(0, atIdx);
  const domain = lower.slice(atIdx + 1);
  const parts = domain.split('.');
  if (parts.length < 2 || parts[parts.length - 1].length < 2) return 'Please enter a valid email address.';
  if (BLOCKED_DOMAINS.has(domain)) return 'Disposable email addresses are not allowed. Please use a real email.';
  if (local.length < 3) return 'Please enter a valid email address.';
  for (const p of FAKE_PATTERNS) { if (p.test(local)) return 'Please use your real email address.'; }
  return null;
}

export default function SignupPage() {
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMismatch, setPasswordMismatch] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    const formData = new FormData(e.currentTarget)
    const email = (formData.get('email') || '').trim()
    const password = formData.get('password') || ''
    const emailErr = validateEmail(email)
    if (emailErr) { setError(emailErr); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match. Please try again.'); setPasswordMismatch(true); return; }
    const firstName = (formData.get('first_name') || '').trim()
    const lastName = (formData.get('last_name') || '').trim()
    if (!firstName || !lastName) { setError('Please enter your first and last name.'); return; }
    setIsLoading(true)
    const result = await signup(formData)
    if (result?.error) { setError(result.error); setIsLoading(false); }
    else if (result?.message) { setMessage(result.message); setIsLoading(false); }
  }

  return (
    <SiteAuth
      title="Create your account"
      subtitle="One login for the whole household."
      footer={
        <p>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="site-form">
        <div className="site-form-row">
          <div className="input-group">
            <label htmlFor="first_name">First name</label>
            <input className="input" id="first_name" name="first_name" type="text" autoComplete="given-name" required />
          </div>
          <div className="input-group">
            <label htmlFor="last_name">Last name</label>
            <input className="input" id="last_name" name="last_name" type="text" autoComplete="family-name" required />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" autoComplete="email" required />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input className="input" id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </div>

        <div className="input-group">
          <div className="site-label-row">
            <label htmlFor="confirm_password">Confirm password</label>
            {passwordMismatch && <span className="site-err">Doesn’t match</span>}
          </div>
          <input
            className="input"
            id="confirm_password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={e => {
              setConfirmPassword(e.target.value)
              setPasswordMismatch(false)
            }}
            aria-invalid={passwordMismatch}
          />
        </div>

        {error && <p className="site-err">{error}</p>}
        {message && <p className="site-ok">{message}</p>}

        <button type="submit" className="site-btn site-btn-block" disabled={isLoading}>
          {isLoading ? 'Creating account…' : 'Continue'}
        </button>
      </form>
    </SiteAuth>
  )
}
