import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import react from '@vitejs.plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
    allowedHosts: [
      'frontend-xaiw.onrender.com', // Dominio de Render
      '.onrender.com'               // Permite cualquier subdominio en Render (opcional pero recomendado)
    ]
  }
})

