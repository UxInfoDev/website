import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { resolve } from 'path'

export default defineConfig({
  base: '/admin/',
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist-admin',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'admin.html')
      }
    }
  }
})
