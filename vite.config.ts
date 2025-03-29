import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

declare module '@remix-run/node' {
  interface Future {
    v3_singleFetch: true
  }
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    // Custom plugin to resolve the remix:manifest warning
    {
      name: 'remix-manifest-resolver',
      resolveId(id) {
        if (id === 'remix:manifest') {
          return id
        }
      },
      load(id) {
        if (id === 'remix:manifest') {
          return 'export default {}'
        }
      },
    },
    tsconfigPaths(),
  ],
  build: {
    manifest: true,
  },
  optimizeDeps: {
    include: ['@remix-run/react'],
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  // Configure React compiler (React Fast Refresh)
  server: {
    hmr: true,
  },
  css: {
    devSourcemap: true,
  },
  // Configure React compiler
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
})
