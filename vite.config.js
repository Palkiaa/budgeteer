import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Budget ZA',
        short_name: 'Budget ZA',
        description: 'South African Budget Tracker',
        theme_color: '#3498db',
        icons: [
          {
            src: 'assets/favicon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: 'assets/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}']
      }
    })
  ]
});
