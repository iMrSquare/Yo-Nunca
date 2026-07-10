import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { api } from './server/api.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // ADMIN_PASSWORD no lleva el prefijo VITE_ (no debe llegar al bundle del
  // cliente), así que hay que cargarlo a mano para que la API embebida en
  // este mismo proceso de desarrollo pueda leerlo vía process.env.
  const env = loadEnv(mode, process.cwd(), '')
  if (env.ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD) {
    process.env.ADMIN_PASSWORD = env.ADMIN_PASSWORD
  }

  return {
    server: { host: true },
    plugins: [
      react(),
      {
        // Monta la API (Express + SQLite) dentro del servidor de desarrollo de
        // Vite, así `npm run dev` sirve app y API en el mismo puerto.
        name: 'yn-api',
        configureServer(server) {
          server.middlewares.use(api)
        },
        configurePreviewServer(server) {
          server.middlewares.use(api)
        },
      },
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        // Sin esto, `npm run dev` no inyecta el manifest ni el service
        // worker: iOS solo ve las etiquetas apple-mobile-web-app-* sueltas,
        // sin manifest no entra en verdadero modo standalone (display-mode
        // daba "false" y Safari reservaba parte de su chrome).
        devOptions: { enabled: true },
        manifest: {
          name: 'Yo Nunca',
          short_name: 'Yo Nunca',
          description: 'El juego de "Yo nunca he...". Elige listas, mézclalas y jugad pasando el móvil.',
          lang: 'es',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          theme_color: '#1c0c33',
          background_color: '#070410',
          icons: [
            { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: 'maskable-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // Nunca cachear la API: las listas/estadísticas deben ir siempre al servidor.
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              urlPattern: /^\/api\//,
              handler: 'NetworkOnly',
            },
          ],
        },
      }),
    ],
  }
})
