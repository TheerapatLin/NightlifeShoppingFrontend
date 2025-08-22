import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Exclude .Trash folder to prevent permission errors
      deny: ['**/.Trash/**', '**/Trash/**']
    }
  }
})
