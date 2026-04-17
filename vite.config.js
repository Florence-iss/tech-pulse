import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  server: {
    port: 5173,
    proxy: {
      // Only proxy /api in development — in production the frontend calls VITE_API_BASE_URL directly
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Chunk vendor libraries for better caching
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
}));
