import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import * as path from 'path'
import babel from 'vite-plugin-babel'

declare module '@remix-run/node' {
  interface Future {
    v3_singleFetch: true
  }
}

const ReactCompilerConfig = {
  target: '18',
}

export default defineConfig({
  server: {
    host: true,
    port: parseInt(process.env.FE_PORT || '5173'),
    strictPort: true,
    watch: {
      usePolling: true,
    },
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
      // Use standard ignoredRouteFiles pattern
      ignoredRouteFiles: ['**/.*'],
    }),
    babel({
      filter: /\.[jt]sx?$/,
      babelConfig: {
        presets: ['@babel/preset-typescript'],
        plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
      },
    }),
    tsconfigPaths(),
  ],
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts'],
    esbuildOptions: {
      // Prevent tree-shaking of recharts internal dependencies
      keepNames: true,
    },
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
  esbuild: {
    jsx: 'automatic',
    keepNames: true, // Helps with constructor names and function declarations
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
    },
  },
  // Add explicit handling for SVG URL imports
  assetsInclude: ['**/*.svg'],
  css: {
    preprocessorOptions: {
      // Add any CSS preprocessor options if needed
    },
  },
})
