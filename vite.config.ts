import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { sdbsPlugin } from './server/sdbsPlugin.ts'

export default defineConfig({
  plugins: [react(), tailwindcss(), sdbsPlugin()],
  server: {
    port: 5173,
  },
})
