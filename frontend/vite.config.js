import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ViteImageOptimizer({
      jpg: { quality: 85 },
      jpeg: { quality: 85 },
      png: { quality: 85 },
      webp: { quality: 85 },
    }),
    visualizer({
      open: true, // abre el reporte automáticamente en el navegador
      filename: 'stats.html', // nombre del archivo que genera
      gzipSize: true,
      brotliSize: true,
    }),
  ],
})