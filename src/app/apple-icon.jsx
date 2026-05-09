import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#201b44', // Dark space purple
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '380px', height: '380px' }}>
          {/* The Rays */}
          <div style={{ position: 'absolute', width: '48px', height: '320px', background: 'white', borderRadius: '24px' }} />
          <div style={{ position: 'absolute', width: '320px', height: '48px', background: 'white', borderRadius: '24px' }} />
          <div style={{ position: 'absolute', width: '48px', height: '320px', background: 'white', borderRadius: '24px', transform: 'rotate(45deg)' }} />
          <div style={{ position: 'absolute', width: '48px', height: '320px', background: 'white', borderRadius: '24px', transform: 'rotate(-45deg)' }} />
          {/* The Center Circle */}
          <div style={{ position: 'absolute', width: '170px', height: '170px', background: 'white', borderRadius: '85px' }} />
        </div>
      </div>
    ),
    { ...size }
  )
}
