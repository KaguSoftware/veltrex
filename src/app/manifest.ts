import type { MetadataRoute } from 'next'
import { ORG } from '@/lib/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: ORG.legalName,
    short_name: ORG.shortName,
    start_url: '/',
    display: 'standalone',
    // Never #ffffff or #000000. paper-50 and the brand navy.
    background_color: '#FCFBF8',
    theme_color: '#082358',
    icons: [
      // Maskable only. The outer 10 percent may be cropped by the launcher, so
      // these are generated with the mark inside the safe circle.
      { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  }
}
