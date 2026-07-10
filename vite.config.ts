import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
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
    ],
  }
})
