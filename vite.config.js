import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Use '/' for Netlify (serves from root)
  // Use '/MovieApp_-/' for GitHub Pages
  base: '/',
  publicDir: 'public',
  build: {
    outDir: 'dist'
  }
})
