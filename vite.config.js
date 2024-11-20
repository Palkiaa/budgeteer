import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',  // Automatically updates the PWA
      manifest: {
        name: 'Budget ZA',
        short_name: 'Budget ZA',
        description: 'Make Budget Simple',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/images/favicon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/images/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],  // Cache relevant files
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ]
});
