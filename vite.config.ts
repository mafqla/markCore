import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'markcore',
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
        entryFileNames: 'core/[name]-[hash].ts',
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
