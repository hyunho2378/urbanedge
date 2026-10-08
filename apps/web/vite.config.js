import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 로컬 샌드박스는 네이티브 CSS 압축기를 실행하지 못하므로 Vercel 빌드에서만 압축한다.
export default defineConfig({
  plugins: [react()],
  server: { host: '127.0.0.1' },
  build: { cssMinify: process.env.VERCEL ? 'lightningcss' : false },
})
