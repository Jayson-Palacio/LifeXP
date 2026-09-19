import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#1E1B4B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', width: 18, height: 118, background: 'white', borderRadius: 9 }} />
        <div style={{ position: 'absolute', width: 118, height: 18, background: 'white', borderRadius: 9 }} />
        <div style={{ position: 'absolute', width: 18, height: 118, background: 'white', borderRadius: 9, transform: 'rotate(45deg)' }} />
        <div style={{ position: 'absolute', width: 18, height: 118, background: 'white', borderRadius: 9, transform: 'rotate(-45deg)' }} />
        <div style={{ position: 'absolute', width: 64, height: 64, background: 'white', borderRadius: 32 }} />
      </div>
    ),
    { ...size }
  )
}
