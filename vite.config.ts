import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
import { visualizer } from 'rollup-plugin-visualizer';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';


const plugins = [
  react(),
  tailwindcss(),
  jsxLocPlugin(),
  vitePluginManusRuntime(),
  visualizer({ open: false, gzipSize: true, brotliSize: true }),
  ViteImageOptimizer({
    png: {
      quality: 85,
      compressionLevel: 9,
    },
    jpeg: {
      quality: 85,
      progressive: true,
    },
    jpg: {
      quality: 85,
      progressive: true,
    },
    webp: {
      quality: 85,
      lossless: false,
    },
    avif: {
      quality: 85,
      lossless: false,
    },
    svg: {
      multipass: true,
      plugins: [
        { name: 'preset-default', params: { overrides: { cleanupNumericValues: false } } },
      ],
    },
    include: /\/assets\/.*\.(png|jpe?g|webp|avif|svg)$/i,
  }),
];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    sourcemap: false,
    reportCompressedSize: true,
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, "client", "index.html"),
        admin: path.resolve(import.meta.dirname, "client", "index-admin.html"),
      },
      output: {
        manualChunks(id: string) {
          // React core
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "vendor-react";
          }
          // tRPC + React Query
          if (id.includes("node_modules/@trpc/") || id.includes("node_modules/@tanstack/react-query")) {
            return "vendor-trpc";
          }
          // Radix UI
          if (id.includes("node_modules/@radix-ui/")) {
            return "vendor-radix";
          }
          // Charts (recharts + d3) - heavy, admin-only - lazy loaded
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-")) {
            return "vendor-charts";
          }
          // Framer Motion - heavy animation
          if (id.includes("node_modules/framer-motion")) {
            return "vendor-motion";
          }
          // Streamdown markdown renderer
          if (id.includes("node_modules/streamdown")) {
            return "vendor-streamdown";
          }
          // Date utilities
          if (id.includes("node_modules/date-fns")) {
            return "vendor-date";
          }
          // Form utilities
          if (id.includes("node_modules/react-hook-form") || id.includes("node_modules/zod")) {
            return "vendor-forms";
          }
          // Lucide icons
          if (id.includes("node_modules/lucide-react")) {
            return "vendor-icons";
          }
          // DnD kit
          if (id.includes("node_modules/@dnd-kit/")) {
            return "vendor-dnd";
          }
          // Misc UI libs
          if (
            id.includes("node_modules/embla-carousel") ||
            id.includes("node_modules/vaul") ||
            id.includes("node_modules/cmdk") ||
            id.includes("node_modules/sonner") ||
            id.includes("node_modules/next-themes")
          ) {
            return "vendor-ui-misc";
          }
          // Wouter router
          if (id.includes("node_modules/wouter")) {
            return "vendor-router";
          }
          // Web Vitals
          if (id.includes("node_modules/web-vitals")) {
            return "vendor-web-vitals";
          }
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      overlay: true,
    },
    fs: {
      strict: false,
    },
    watch: {
      usePolling: false,
      interval: 1000,
    },
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'framer-motion',
      'recharts',
    ],
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp'],
});
