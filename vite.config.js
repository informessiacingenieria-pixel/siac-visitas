import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-siac.png'],
      manifest: {
        name: 'SIAC Ingeniería',
        short_name: 'SIAC',
        description: 'Sistema de visitas técnicas SIAC Ingeniería SPA',
        theme_color: '#0f4c8a',
        background_color: '#0f4c8a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'logo-siac.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo-siac.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})