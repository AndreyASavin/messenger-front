import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8080
  },
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  worker: {
    format: 'es',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'ESNext'
  },
  css: {
    preprocessorOptions: {
      scss: {
          additionalData:
          // `
          //   @use "./src/assets/scss/index.scss" as *;
          // `
          `
          @import "@/assets/scss/index.scss";
          `
      }
    }
  },
})
