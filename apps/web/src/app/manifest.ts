import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'InTrainin',
    short_name: 'InTrainin',
    description:
      'Get trained in role-specific skills, earn verifiable certificates, and get matched to real jobs — for free.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f2ede6',
    theme_color: '#f2ede6',
    categories: ['education', 'productivity'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: '/og.png',
        sizes: '1200x630',
        type: 'image/png',
        form_factor: 'wide',
        label: 'InTrainin — Get trained. Get certified. Get hired.',
      },
    ],
  }
}
