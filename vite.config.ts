import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Multi-page build: the PTO tracker at / and the CONEXPO-CON/AGG
      // homepage redesign concept at /conexpo/.
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        conexpo: resolve(import.meta.dirname, 'conexpo/index.html'),
      },
    },
  },
})
