import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // apps/api (wrangler dev) runs on 8787 by default
      '/api': 'http://localhost:8787',
    },
  },
})
