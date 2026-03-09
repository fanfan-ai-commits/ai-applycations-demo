import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'

export default defineConfig({
  define: {
    'process.env': {}
  },
  plugins: [
    vue(),
    WindiCSS(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
