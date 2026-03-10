import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/airtable': {
        target: 'https://api.airtable.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/airtable/, ''),
        headers: {}
      }
    }
  }
})
