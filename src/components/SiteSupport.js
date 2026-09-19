'use client';

import { useState } from 'react';
import { submitContactTicket } from '../app/actions/support';

export default function SiteSupport({ onSuccess, onClose }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !message.trim()) {
      setNotice({ type: 'error', text: 'Please enter your email and a message.' });
      return;
    }
    setSending(true);
    setNotice(null);
    try {
      const res = await submitContactTicket(email.trim(), message.trim(), 'feature');
      if (res.success) {
        setNotice({ type: 'success', text: 'Received. We’ll get back to you shortly.' });
        setMessage('');
        if (onSuccess) setTimeout(() => onSuccess(), 1600);
      } else {
        setNotice({ type: 'error', text: res.error || 'Could not send. Try again.' });
      }
    } catch {
      setNotice({ type: 'error', text: 'Something went wrong. Try again.' });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="site-sheet">
      <button type="button" className="site-sheet-close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <h2>How can we help?</h2>
      <p>Questions, bugs, or an idea for the household. We read everything.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="site-support-email">Email</label>
        <input
          id="site-support-email"
          className="input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="site-support-message">Message</label>
        <textarea
          id="site-support-message"
          className="input"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        {notice && (
          <p className={notice.type === 'success' ? 'site-ok' : 'site-err'}>{notice.text}</p>
        )}
        <button type="submit" className="site-btn" disabled={sending}>
          {sending ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  );
}
