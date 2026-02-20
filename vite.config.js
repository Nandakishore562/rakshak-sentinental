import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for GitHub Pages
  server: {
    host: true, // Exposes server to network (0.0.0.0)
    proxy: {
      '/api': 'http://localhost:3000' // Proxies API calls to backend
    }
  }
})
