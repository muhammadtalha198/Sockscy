import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Uncomment to proxy API calls to the Go backend during development:
    // proxy: { '/api': 'http://localhost:8080' },
  },
})
