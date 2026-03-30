import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { tmpdir } from 'os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const r = (p: string) => resolve(__dirname, 'node_modules', p)

// Place Vite's dep cache in the OS temp dir so Windows Defender does not
// hold a lock during the deps_temp → deps atomic rename (EPERM on Windows).
const CACHE_DIR = resolve(tmpdir(), 'ecotrade-vite-cache')

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],

  cacheDir: CACHE_DIR,

  resolve: {
    // Use REGEX aliases (exact match) so 'react' does not accidentally
    // prefix-match 'react/jsx-runtime' and produce a broken path.
    alias: [
      { find: /^react\/jsx-dev-runtime$/, replacement: r('react/jsx-dev-runtime.js') },
      { find: /^react\/jsx-runtime$/,     replacement: r('react/jsx-runtime.js') },
      { find: /^react-dom\/client$/,      replacement: r('react-dom/client.js') },
      { find: /^react-dom\/server$/,      replacement: r('react-dom/server.js') },
      { find: /^react-dom$/,              replacement: r('react-dom/index.js') },
      { find: /^react$/,                  replacement: r('react/index.js') },
    ],
    dedupe: ['react', 'react-dom'],
  },

  optimizeDeps: {
    // Pre-bundle React + antd ecosystem so every CJS require('react') inside
    // @rc-component/*, @ant-design/cssinjs, etc. uses the same instance.
    // NOTE: sub-path exports (react/jsx-runtime) cannot go here in Vite 6 —
    // they are handled by the alias above instead.
    include: [
      'react',
      'react-dom',
      'antd',
      '@ant-design/icons',
      '@ant-design/cssinjs',
      'framer-motion',
      'leaflet',
      'react-leaflet',
    ],
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text'],
      include: ['src/services', 'src/utils', 'src/components/dashboard/StatCard.tsx'],
    },
  },

  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('leaflet')) return 'vendor-leaflet';
            if (id.includes('recharts') || id.includes('chart.js')) return 'vendor-charts';
            if (id.includes('antd') || id.includes('@ant-design')) return 'vendor-antd';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('react-dom') || id.includes('react-router') || /\/node_modules\/react\//.test(id)) return 'vendor-react';
            if (id.includes('lucide-react')) return 'vendor-icons';
          }
        },
      },
    },
  },
})
