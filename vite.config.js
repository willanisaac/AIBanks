import process from 'node:process'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),    tailwindcss(),
],
  server: {
    proxy: {
      // Proxy ML API to avoid CORS
      '/api/ml': {
        target: process.env.VITE_ML_API_URL || 'https://www.kapisg.com/apipronostico',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ml/, ''),
        timeout: 10000,
      },
      // Proxy TheSportsDB API to avoid CORS in the browser
      '/api/thesportsdb': {
        target: 'https://www.thesportsdb.com/api/v1/json/3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/thesportsdb/, ''),
        timeout: 5000,
      },
      // Proxy FIFA API to avoid CORS
      '/api/fifa': {
        target: 'https://api.fifa.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fifa/, '/api'),
        timeout: 5000,
      },
    },
  },

})
