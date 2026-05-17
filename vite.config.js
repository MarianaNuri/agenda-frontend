import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: '/agenda-frontend/',
  plugins: [
    vue(),
    vueDevTools(),
    // Plugin que ajusta fetch('/config.json') para GitHub Pages
    {
      name: 'rewrite-config-path',
      transform(code, id) {
        if (id.includes('config/api')) {
          return code.replace(
            "fetch('/config.json')",
            "fetch('/agenda-frontend/config.json')"
          )
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
