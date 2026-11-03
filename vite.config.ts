import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8000'


  const proxyConfig = {
    '/api': {
      target: proxyTarget,
      changeOrigin: true,
      secure: false,
      ws: true,
    },
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: proxyConfig,
    },
  }
})
