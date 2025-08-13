import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 👇 tambahkan ini agar semua referensi ke 'three' gunakan versi utama
      three: path.resolve(__dirname, 'node_modules/three'),
    },
    dedupe: ['three'], // tetap pertahankan ini
  },
  build: {
    sourcemap: true,
  },
})
