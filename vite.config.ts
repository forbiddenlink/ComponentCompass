import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'algolia-vendor': ['algoliasearch', '@algolia/client-insights'],
          'ai-vendor': ['ai', '@ai-sdk/react'],
          'markdown-vendor': ['react-markdown', 'prism-react-renderer'],
        },
      },
    },
    // Increase chunk size warning limit to 600KB (we've split large deps)
    chunkSizeWarningLimit: 600,
  },
})
