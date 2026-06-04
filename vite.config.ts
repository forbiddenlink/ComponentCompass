import { defineConfig, loadEnv, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Dev-only middleware so POST /api/generate works under `pnpm dev`
 * without the Vercel CLI. Loads the framework-agnostic core via Vite's
 * SSR module loader (so TS + env are handled) and returns its JSON.
 */
function devApiPlugin(): PluginOption {
  return {
    name: 'trace-dev-api',
    apply: 'serve',
    configureServer(server) {
      // Surface server-only secrets (no VITE_ prefix) into process.env for the core.
      const env = loadEnv(server.config.mode, server.config.root, '')
      for (const key of ['GOOGLE_GENERATIVE_AI_API_KEY', 'GEMINI_MODEL']) {
        if (env[key] && !process.env[key]) process.env[key] = env[key]
      }
      server.middlewares.use('/api/generate', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }
        // Kill switch parity with the production handler.
        if (process.env.TRACE_DISABLED === '1') {
          res.statusCode = 503
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Trace is temporarily unavailable' }))
          return
        }
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }
        try {
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const body = JSON.parse(Buffer.concat(chunks).toString('utf-8') || '{}')
          const { imageDataUrl, previousJsx, errorMessage, repairReason } = body
          if (!imageDataUrl || typeof imageDataUrl !== 'string') {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'imageDataUrl is required' }))
            return
          }
          // Body-size guard parity (~4MB decoded, base64 ~33% larger).
          if (imageDataUrl.length > Math.ceil((4 * 1024 * 1024 * 4) / 3) + 1024) {
            res.statusCode = 413
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'That image is too large. Please try one under 4 MB.' }))
            return
          }
          const repair =
            typeof previousJsx === 'string' && typeof errorMessage === 'string'
              ? {
                  previousJsx,
                  errorMessage,
                  repairReason:
                    repairReason === 'a11y'
                      ? 'a11y'
                      : repairReason === 'refine'
                        ? 'refine'
                        : 'compile',
                }
              : undefined
          const mod = await server.ssrLoadModule('/api/generate.ts')
          const result = await mod.generateFromScreenshot(imageDataUrl, repair)
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result))
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Generation failed'
          res.statusCode = message.includes('too large')
            ? 413
            : message.includes('data URL') || message.includes('Unsupported image type')
              ? 400
              : 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: message }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devApiPlugin()],
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
          if (id.includes('node_modules/ai/') || id.includes('node_modules/@ai-sdk')) {
            return 'ai-vendor';
          }
        },
      },
    },
    // Increase chunk size warning limit to 600KB (we've split large deps)
    chunkSizeWarningLimit: 600,
  },
})
