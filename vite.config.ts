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

// React Compiler configuration
const ReactCompilerConfig = {
  target: '18', // Target React 18
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
  build: {
    minify: true,
    rollupOptions: {
      output: {
        // No manual chunks
      },
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
      ignoredRouteFiles: ['**/.*'],
      serverModuleFormat: 'esm',
    }),
    babel({
      filter: /\.[jt]sx?$/,
      babelConfig: {
        presets: ['@babel/preset-typescript'], // if you use TypeScript
        plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
      },
    }),
    tsconfigPaths(),
  ],
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query'],
    force: true,
    esbuildOptions: {
      resolveExtensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
  },
  esbuild: {
    jsx: 'automatic',
    target: 'es2020',
    legalComments: 'none',
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
    },
    dedupe: ['react', 'react-dom'],
  },
})
