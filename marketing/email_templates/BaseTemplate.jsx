import * as React from 'react';

/**
 * Kaeluma Email Base Template Component (React Email styled)
 * 
 * Props:
 * - title: Header heading string
 * - previewText: Email client preview snippet
 * - parentName: Recipient parent name
 * - ctaText: Button text (optional)
 * - ctaUrl: Button URL (optional)
 * - children: Body content JSX
 */
export const KaelumaBaseEmail = ({
  title,
  previewText,
  parentName,
  ctaText,
  ctaUrl,
  children
}) => {
  return (
    <div style={containerStyle}>
      {/* Hidden Preview text for clients */}
      <span style={previewTextStyle}>{previewText}</span>

      {/* Header Bar */}
      <table width="100%" cellPadding="0" cellSpacing="0" style={headerTableStyle}>
        <tr>
          <td align="center" style={headerTdStyle}>
            <span style={logoIconStyle}>☀️</span>
            <span style={logoTextStyle}>Kaeluma</span>
          </td>
        </tr>
      </table>

      {/* Main Container */}
      <table width="100%" cellPadding="0" cellSpacing="0" style={bodyTableStyle}>
        <tr>
          <td style={bodyTdStyle}>
            <h1 style={h1Style}>{title}</h1>
            
            <p style={salutationStyle}>Hi {parentName},</p>
            
            <div style={contentStyle}>
              {children}
            </div>

            {/* Optional Call to Action Button */}
            {ctaText && ctaUrl && (
              <div style={ctaContainerStyle}>
                <a href={ctaUrl} style={ctaButtonStyle}>
                  {ctaText}
                </a>
              </div>
            )}
            
            <p style={signoffStyle}>
              Best,<br />
              <strong>Jayson</strong><br />
              <span style={signoffSubStyle}>Founder, Kaeluma</span>
            </p>
          </td>
        </tr>
      </table>

      {/* Value-for-Value Stripe Donation Footer */}
      <table width="100%" cellPadding="0" cellSpacing="0" style={footerTableStyle}>
        <tr>
          <td align="center" style={footerTdStyle}>
            <div style={donationBoxStyle}>
              <span style={heartStyle}>💖</span>
              <p style={donationTitleStyle}>Support Kaeluma</p>
              <p style={donationTextStyle}>
                Kaeluma is 100% free for everyone, ad-free, and subscription-free. 
                We rely entirely on parent donations to cover server and database hosting costs.
              </p>
              <a href="https://donate.stripe.com/28EfZg6aG81Of5zd8ggQE00" style={donationButtonStyle}>
                Support Our Guild on Stripe
              </a>
            </div>
            
            <p style={legalStyle}>
              © {new Date().getFullYear()} Kaeluma. Built by a dad for families.<br />
              If you wish to manage your notifications, log in to your <a href="https://kaeluma.com/parent" style={footerLinkStyle}>Parent Settings</a>.
            </p>
          </td>
        </tr>
      </table>
    </div>
  );
};

// --- STYLING OBJECTS (React Email Inline CSS compliant) ---

const containerStyle = {
  backgroundColor: '#f3f4f6',
  padding: '24px 16px',
  fontFamily: "'Inter', -apple-system, sans-serif",
  color: '#374151',
  lineHeight: '1.6',
};

const previewTextStyle = {
  display: 'none',
  maxHeight: '0px',
  overflow: 'hidden',
  opacity: 0,
};

const headerTableStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#1E1B4B', /* Deep Navy */
  borderRadius: '8px 8px 0 0',
};

const headerTdStyle = {
  padding: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
};

const logoIconStyle = {
  fontSize: '1.8rem',
  lineHeight: '1',
};

const logoTextStyle = {
  fontSize: '1.5rem',
  fontWeight: '800',
  color: '#FFFFFF',
  letterSpacing: '-0.02em',
};

const bodyTableStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#FFFFFF',
  borderLeft: '1px solid #e5e7eb',
  borderRight: '1px solid #e5e7eb',
};

const bodyTdStyle = {
  padding: '40px 32px 32px 32px',
};

const h1Style = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: '22px',
  fontWeight: '800',
  color: '#1E1B4B',
  marginTop: '0',
  marginBottom: '24px',
  lineHeight: '1.3',
};

const salutationStyle = {
  fontSize: '15px',
  marginHeight: '0',
  marginBottom: '16px',
};

const contentStyle = {
  fontSize: '15px',
  color: '#4B5563',
};

const ctaContainerStyle = {
  margin: '32px 0',
  textAlign: 'center',
};

const ctaButtonStyle = {
  backgroundColor: '#A855F7', /* Kaeluma Glowing Purple */
  color: '#FFFFFF',
  padding: '12px 28px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  display: 'inline-block',
  fontSize: '15px',
  boxShadow: '0 4px 15px rgba(168, 85, 247, 0.25)',
};

const signoffStyle = {
  fontSize: '15px',
  marginTop: '32px',
  marginBottom: '0',
  color: '#1F2937',
};

const signoffSubStyle = {
  fontSize: '13px',
  color: '#6B7280',
};

const footerTableStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#FFFFFF',
  borderRadius: '0 0 8px 8px',
  borderLeft: '1px solid #e5e7eb',
  borderRight: '1px solid #e5e7eb',
  borderBottom: '1px solid #e5e7eb',
};

const footerTdStyle = {
  padding: '0 32px 32px 32px',
};

const donationBoxStyle = {
  backgroundColor: 'rgba(99, 102, 241, 0.05)', /* Soft Indigo Tint */
  border: '1px solid rgba(99, 102, 241, 0.15)',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
};

const heartStyle = {
  fontSize: '1.5rem',
  display: 'block',
  marginBottom: '8px',
};

const donationTitleStyle = {
  fontWeight: '800',
  fontSize: '14px',
  color: '#312E81',
  margin: '0 0 6px 0',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const donationTextStyle = {
  fontSize: '13px',
  color: '#4B5563',
  margin: '0 0 16px 0',
  lineHeight: '1.5',
};

const donationButtonStyle = {
  backgroundColor: '#3B82F6', /* Kaeluma Vivid Blue */
  color: '#FFFFFF',
  padding: '8px 16px',
  textDecoration: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
  display: 'inline-block',
  fontSize: '13px',
};

const legalStyle = {
  fontSize: '11px',
  color: '#9CA3AF',
  lineHeight: '1.5',
  margin: '0',
};

const footerLinkStyle = {
  color: '#6B7280',
  textDecoration: 'underline',
};
