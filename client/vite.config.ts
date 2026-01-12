import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            'babel-plugin-react-compiler',
            {
              runtimeModule: 'react-compiler-runtime',
              target: '18',
            },
          ],
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      'react/compiler-runtime': 'react-compiler-runtime',
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  build: {
    outDir: '../server/dist',
  },
  base: '/',
});
