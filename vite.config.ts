import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

// Builds the admin SPA into resources/dist so the prebuilt assets can be
// committed and served by the package's Blade view without a JS toolchain on
// the consumer side. The manifest is read by InvitationsAdminServiceProvider.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    manifest: true,
    outDir: resolve(__dirname, 'resources/dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'resources/js/main.tsx'),
    },
  },
});
