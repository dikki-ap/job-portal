import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5167,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5067',
        changeOrigin: true,
      },
      '/swagger': {
        target: 'http://localhost:5067',
        changeOrigin: true,
      },
    },
  },
})
