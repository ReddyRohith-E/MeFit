import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  // Load env variables based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || 'http://localhost:5000';
  
  return {
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
      // Remove proxy configuration to let React Router handle all frontend routes
      // API calls will go directly to the backend server
    },
    preview: {
      port: 5173,
      host: true,
      historyApiFallback: true,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime']
    }
  };
});