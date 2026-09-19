import { ImageResponse } from 'next/og'

export const alt = 'Kaeluma — Software for the whole family'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#f5f5f7',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 20,
              background: '#1d1d1f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div style={{ position: 'absolute', width: 12, height: 56, background: 'white', borderRadius: 8 }} />
            <div style={{ position: 'absolute', width: 56, height: 12, background: 'white', borderRadius: 8 }} />
            <div style={{ position: 'absolute', width: 12, height: 56, background: 'white', borderRadius: 8, transform: 'rotate(45deg)' }} />
            <div style={{ position: 'absolute', width: 12, height: 56, background: 'white', borderRadius: 8, transform: 'rotate(-45deg)' }} />
            <div style={{ position: 'absolute', width: 28, height: 28, background: 'white', borderRadius: 14 }} />
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 600,
              fontFamily: 'sans-serif',
              color: '#1d1d1f',
              letterSpacing: '-0.04em',
            }}
          >
            Kaeluma
          </div>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            fontWeight: 400,
            fontFamily: 'sans-serif',
            color: '#6e6e73',
            letterSpacing: '-0.02em',
          }}
        >
          Live well, together.
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
