import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Built into ../vendor so Netlify serves it at /vendor on the main site
export default defineConfig({
  base: '/vendor/',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  build: { outDir: '../vendor', emptyOutDir: true },
})
