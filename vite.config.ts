import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  
  return {
    base: isDev ? '/' : './',
    plugins: [
      react(),
      electron({
        main: {
          entry: 'electron/main.ts',
          vite: {
            build: {
              outDir: 'dist/electron',
              rollupOptions: {
                external: ['electron'],
                output: {
                  entryFileNames: '[name].js',
                  chunkFileNames: '[name].js',
                  assetFileNames: '[name].[ext]',
                },
              },
            },
          },
        },
        preload: {
          input: 'electron/preload.ts',
        },
      }),
    ],
    build: {
      outDir: 'dist/app',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]',
        },
      },
    },
    server: {
      port: 5173,
    },
  }
})
