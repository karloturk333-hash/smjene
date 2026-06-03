import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev proxy: /api/* → Express API na :4000 (izbjegava CORS i hardkodirani host).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
