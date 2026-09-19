export default function manifest() {
  return {
    name: 'Kaeluma',
    short_name: 'Kaeluma',
    description: 'Turn real-life family routines into a game kids actually enjoy.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0d14',
    theme_color: '#1E1B4B',
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
