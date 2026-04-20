import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
