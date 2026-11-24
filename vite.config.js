import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Plain SPA build. public/settings.json is copied as-is and fetched at runtime.
export default defineConfig({
  plugins: [react()],
})
