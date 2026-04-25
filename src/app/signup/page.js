'use client'

import { useState } from 'react'
import Link from 'next/link'
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
    setIsLoading(true)
    const result = await signup(formData)
    if (result?.error) { setError(result.error); setIsLoading(false); }
    else if (result?.message) { setMessage(result.message); setIsLoading(false); }
  }


  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="kaeluma-bg" />
      
      <div style={{ zIndex: 1, background: 'rgba(10, 8, 20, 0.7)', backdropFilter: 'blur(16px)', padding: 'var(--space-2xl)', borderRadius: 'var(--radius-2xl)', width: '100%', maxWidth: 400, border: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: 'var(--space-xl)', background: 'linear-gradient(135deg, #ec4899, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Create Account
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
          {message && <p style={{ color: 'var(--green, #10b981)', fontSize: '0.95rem', fontWeight: 'bold', textAlign: 'center' }}>{message}</p>}

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={isLoading} style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
            {isLoading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-xl)', color: 'var(--text-muted)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Log in</Link>
        </p>
      </div>
    </div>
  )
}
