import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: []
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
    exclude: [],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    // Optimize build output
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'utils': ['axios'],
          
          // Feature chunks
          'auth-pages': [
            './src/pages/Login.jsx',
            './src/pages/Register.jsx'
          ],
          'main-pages': [
            './src/pages/Dashboard.jsx',
            './src/pages/Pets.jsx'
          ],
          'feature-pages': [
            './src/pages/Shop.jsx',
            './src/pages/MiniGames.jsx',
            './src/pages/DailyMissions.jsx',
            './src/pages/Friends.jsx'
          ]
        }
      }
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 500,
    // Generate source maps for production debugging
    sourcemap: process.env.NODE_ENV === 'development'
  },
  // CSS optimization
  css: {
    devSourcemap: true
  }
})
