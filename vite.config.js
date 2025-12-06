import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  // Add base configuration for deployment
  base: '/',
  // Configure build settings
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  // Configure server settings
  server: {
    port: 3000,
    strictPort: false,
    host: true,
  }
})