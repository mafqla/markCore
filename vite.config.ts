import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        chunkFileNames: 'core/[name]-[hash].ts',
        entryFileNames: 'main.ts',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    lib: {
      entry: 'src/index.ts',
      name: 'markcore',
      fileName: 'core/markcore'
    }
  }
})
