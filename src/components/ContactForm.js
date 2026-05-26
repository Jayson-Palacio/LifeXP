'use client'

import { useState, useEffect } from 'react'
import { submitContactTicket, submitTicket } from '../app/actions/support'
import { playPop } from '../lib/sounds'

export default function ContactForm({ onSuccess, isModal = false, initialEmail = '' }) {
  const [activeTab, setActiveTab] = useState('message') // 'message' | 'faq'
  const [email, setEmail] = useState(initialEmail)
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('bug') // 'bug' | 'feature'
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState(null) // { type: 'success' | 'error', text: string }

  // FAQ state
  const [activeFaq, setActiveFaq] = useState(null)

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail)
    }
  }, [initialEmail])

  const handleTabChange = (tab) => {
    if (playPop) playPop()
    setActiveTab(tab)
    setNotice(null)
  }

  const handleFaqToggle = (index) => {
    if (playPop) playPop()
    setActiveFaq(activeFaq === index ? null : index)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !message.trim()) {
      setNotice({ type: 'error', text: 'Please fill in both email and message fields.' })
      return
    }

    setSending(true)
    setNotice(null)
    try {
      // Format message body to include category and subject
      const formattedMessage = `[Category: ${category === 'bug' ? 'Bug Report' : 'Feature Idea'}]\n[Subject: ${subject.trim() || 'No Subject'}]\n\n${message.trim()}`
      
      let res
      if (initialEmail) {
        // Logged-in user: submits ticket linked directly to account
        res = await submitTicket(category, formattedMessage)
      } else {
        // Guest user: submits contact ticket associated to admin client
        res = await submitContactTicket(email, formattedMessage, category)
      }

      if (res.success) {
        setNotice({ type: 'success', text: '📩 Message sent! Thank you, we will get back to you shortly.' })
        setSubject('')
        setMessage('')
        if (!initialEmail) {
          setEmail('')
        }
        if (onSuccess) {
          // Keep notice visible for a bit before closing
          setTimeout(() => onSuccess(), 2000)
        }
      } else {
        setNotice({ type: 'error', text: res.error || 'Failed to send message.' })
      }
    } catch (err) {
      setNotice({ type: 'error', text: 'An unexpected error occurred. Please try again.' })
    } finally {
      setSending(false)
    }
  }

  const faqs = [
    {
      q: "How does Kaeluma work?",
      a: "Kaeluma turns chores and habits into a game. Parents create missions, kids check them off to earn XP and Gold Coins, and spend coins in the Reward Shop for custom real-life treats."
    },
    {
      q: "Is there a mobile app?",
      a: "Kaeluma is a Progressive Web App (PWA). Just open Kaeluma in your mobile browser, tap 'Add to Home Screen', and it installs as a full-screen, native-feeling app!"
    },
    {
      q: "How do mission approvals work?",
      a: "When 'Require Approvals' is enabled, kids' submissions show up in the parent dashboard. Tapping 'Approve' awards XP, coins, and updates streaks. Turn it off in Settings for auto-approvals."
    },
    {
      q: "Is our family data safe?",
      a: "Yes. Privacy is our top priority. We do not sell your family's data, display third-party advertisements, or collect unnecessary personal info."
    }
  ]

  return (
    <div style={{
      maxWidth: 600,
      margin: isModal ? '0' : '0 auto 10vh',
      background: isModal ? 'transparent' : 'rgba(30, 33, 53, 0.5)',
      border: isModal ? 'none' : '1px solid var(--bg-glass-border)',
      borderRadius: isModal ? '0' : 'var(--radius-lg)',
      padding: isModal ? '0' : 'var(--space-lg)',
      boxShadow: isModal ? 'none' : '0 4px 20px rgba(0,0,0,0.12)',
      textAlign: 'left'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <span style={{ fontSize: '1.4rem' }}>💬</span>
        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-bright)' }}>Help &amp; Support Center</div>
      </div>

      {/* Glassmorphic Tabs */}
      <div style={{
        display: 'flex',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 'var(--radius-md)',
        padding: 4,
        marginBottom: 20,
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <button
          onClick={() => handleTabChange('message')}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: activeTab === 'message' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: activeTab === 'message' ? 'var(--text-bright)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          ✉️ Send a Message
        </button>
        <button
          onClick={() => handleTabChange('faq')}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: activeTab === 'faq' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            color: activeTab === 'faq' ? 'var(--text-bright)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          ❓ Quick Help FAQ
        </button>
      </div>

      {activeTab === 'message' ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label htmlFor="contact-category" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                Category
              </label>
              <select
                id="contact-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={sending}
                style={{
                  width: '100%',
                  background: '#0f1117',
                  border: '1px solid #2d3148',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-bright)',
                  padding: '10px 12px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="bug">🐛 Report a Bug</option>
                <option value="feature">💡 Suggest a Feature</option>
              </select>
            </div>

            <div>
              <label htmlFor="contact-subject" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                Subject
              </label>
              <input
                id="contact-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. XP didn't update"
                disabled={sending}
                style={{
                  width: '100%',
                  background: '#0f1117',
                  border: '1px solid #2d3148',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-bright)',
                  padding: '10px 12px',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="contact-email" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
              Email Address
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={sending || !!initialEmail}
              style={{
                width: '100%',
                background: initialEmail ? 'rgba(255,255,255,0.02)' : '#0f1117',
                border: '1px solid #2d3148',
                borderRadius: 'var(--radius-sm)',
                color: initialEmail ? 'var(--text-muted)' : 'var(--text-bright)',
                padding: '10px 14px',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: initialEmail ? 'not-allowed' : 'text'
              }}
              required
            />
            {initialEmail && (
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: 4, fontWeight: 600 }}>
                ✓ Pre-filled from your logged-in parent account.
              </div>
            )}
          </div>

          <div>
            <label htmlFor="contact-message" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
              Message Details
            </label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue or suggestion..."
              disabled={sending}
              rows={4}
              style={{
                width: '100%',
                background: '#0f1117',
                border: '1px solid #2d3148',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-bright)',
                padding: '10px 14px',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'vertical',
                minHeight: 100,
                fontFamily: 'inherit'
              }}
              required
            />
          </div>

          {notice && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: notice.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: notice.type === 'success' ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
              color: notice.type === 'success' ? '#4ade80' : '#f87171'
            }}>
              {notice.text}
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="btn btn-primary"
            style={{
              alignSelf: 'flex-start',
              padding: '10px 24px',
              fontSize: '0.9rem',
              cursor: sending ? 'not-allowed' : 'pointer'
            }}
          >
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 350, overflowY: 'auto', paddingRight: 6 }}>
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index
            return (
              <div
                key={index}
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.01)',
                  overflow: 'hidden',
                  transition: 'all 0.25s'
                }}
              >
                <button
                  onClick={() => handleFaqToggle(index)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    background: isOpen ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                    border: 'none',
                    color: 'var(--text-bright)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{ fontSize: '1rem', color: 'var(--text-dim)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(45deg)' : 'rotate(0)' }}>＋</span>
                </button>
                <div style={{
                  maxHeight: isOpen ? 200 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                  <div style={{ padding: '12px 14px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    {faq.a}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
