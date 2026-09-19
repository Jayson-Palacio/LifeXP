export default function manifest() {
  return {
    name: 'Kaeluma',
    short_name: 'Kaeluma',
    description: 'Software for the whole family — routines, health, and home, under one login.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f5f7',
    theme_color: '#f5f5f7',
    icons: [
      {
        src: '/logo_icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}
