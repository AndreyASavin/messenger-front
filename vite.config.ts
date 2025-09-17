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
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // '@composables': resolve(__dirname, './src/composables'),
      // '@components': resolve(__dirname, './src/components'),
      // '@stores': resolve(__dirname, './src/stores'),
      // '@types': resolve(__dirname, './src/types'),
      // '@utils': resolve(__dirname, './src/utils'),
      // '@views': resolve(__dirname, './src/views'),
    },
  },
  build: {
    target: 'ESNext'
  }
})
