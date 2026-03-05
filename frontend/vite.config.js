import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Create a shortcut called /api-sharepoint
      '/api-sharepoint': {
        target: 'https://iontradingcom.sharepoint.com',
        changeOrigin: true,
        secure: false,
        // This removes the "/api-sharepoint" prefix before sending the request to MS
        rewrite: (path) => path.replace(/^\/api-sharepoint/, '')
      }
    }
  }
})