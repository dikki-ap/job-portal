import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    // Scan from entry point so all deps are pre-bundled before first request
    entries: ['./src/main.tsx'],
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'keycloak-js',
      '@reduxjs/toolkit',
      '@reduxjs/toolkit/query/react',
      'react-redux',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
    ],
  },
  server: {
    host: '127.0.0.1', // Force IPv4 — avoids IPv6/IPv4 mismatch on Windows
    port: 5167,
    strictPort: true,
    warmup: {
      clientFiles: ['./src/main.tsx', './src/App.tsx'],
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5067',
        changeOrigin: true,
      },
      '/swagger': {
        target: 'http://127.0.0.1:5067',
        changeOrigin: true,
      },
    },
  },
})
