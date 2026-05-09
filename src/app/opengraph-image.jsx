import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Kaeluma - Turn Real Life Into a Game'
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
          background: '#201b44', // Dark space purple matching the screenshot
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          {/* Sun Logo container */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '220px', height: '220px' }}>
            {/* The Rays */}
            <div style={{ position: 'absolute', width: '30px', height: '180px', background: 'white', borderRadius: '15px' }} />
            <div style={{ position: 'absolute', width: '180px', height: '30px', background: 'white', borderRadius: '15px' }} />
            <div style={{ position: 'absolute', width: '30px', height: '180px', background: 'white', borderRadius: '15px', transform: 'rotate(45deg)' }} />
            <div style={{ position: 'absolute', width: '30px', height: '180px', background: 'white', borderRadius: '15px', transform: 'rotate(-45deg)' }} />
            {/* The Center Circle */}
            <div style={{ position: 'absolute', width: '100px', height: '100px', background: 'white', borderRadius: '50px' }} />
          </div>
          
          {/* Text */}
          <div
            style={{
              fontSize: 160,
              fontWeight: 800,
              fontFamily: 'sans-serif',
              color: '#9c66f5', // The vibrant purple from the screenshot
              letterSpacing: '-0.04em',
              marginLeft: '20px',
              marginTop: '-10px',
            }}
          >
            Kaeluma
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
