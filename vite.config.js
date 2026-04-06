import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy TheSportsDB API to avoid CORS in the browser
      '/api/thesportsdb': {
        target: 'https://www.thesportsdb.com/api/v1/json/3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/thesportsdb/, ''),
        timeout: 5000,
      },
    },
  },
})
