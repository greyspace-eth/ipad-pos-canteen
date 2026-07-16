import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CAFEINE POS',
    short_name: 'CAFEINE',
    description: 'CAFEINE Vendor Point of Sale',
    start_url: '/',
    display: 'standalone',
    orientation: 'landscape',
    background_color: '#0f0e0c',
    theme_color: '#1f8a5b',
    icons: [
      { src: '/icon.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
