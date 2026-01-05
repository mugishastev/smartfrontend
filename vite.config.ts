import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // Changed from react-swc
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode, command }) => {
  // Force production mode detection
  const isProduction = command === 'build' || mode === 'production';
  
  return {
    mode: isProduction ? 'production' : 'development',
    define: {
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      'import.meta.env.MODE': JSON.stringify(isProduction ? 'production' : 'development'),
      'import.meta.env.PROD': isProduction,
      'import.meta.env.DEV': !isProduction,
    },
    server: {
      host: "::",
      port: Number(process.env.PORT) || 3000,
      allowedHosts: [
         "smartco-ophub.andasy.dev",
        "smart-cooperative-hub.onrender.com",
        ".onrender.com",
        "localhost",
        "127.0.0.1",
      ],
    },
    preview: {
      host: "::",
      port: Number(process.env.PORT) || 3000,
      allowedHosts: [
        "smartco-ophub.andasy.dev",
        "localhost",
        "127.0.0.1",
      ],
    },
    plugins: [
      react({
        jsxRuntime: 'automatic',
      }),
      mode === "development" && componentTagger()
    ].filter(Boolean),
    build: {
      minify: 'esbuild',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
