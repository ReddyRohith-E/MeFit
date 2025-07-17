import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000, // Increase limit to 1000kb to suppress warning
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@mui/system'],
          router: ['react-router-dom'],
          utils: ['axios', 'dayjs']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    historyApiFallback: true,
  },
  preview: {
    port: 5173,
    host: true,
    historyApiFallback: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime']
  }
});