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
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/algoliasearch') || id.includes('node_modules/@algolia')) {
            return 'algolia-vendor';
          }
          if (id.includes('node_modules/ai/') || id.includes('node_modules/@ai-sdk')) {
            return 'ai-vendor';
          }
          if (id.includes('node_modules/react-markdown') || id.includes('node_modules/prism-react-renderer')) {
            return 'markdown-vendor';
          }
        },
      },
    },
    // Increase chunk size warning limit to 600KB (we've split large deps)
    chunkSizeWarningLimit: 600,
  },
})
