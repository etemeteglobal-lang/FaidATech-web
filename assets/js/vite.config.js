import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    sourcemap: false, // DevTools ኦሪጅናል ኮዱን እንዳያገኘው ይከለክላል
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // console.log ይደብቃል
      },
    },
  },
});