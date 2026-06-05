import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev proxy: /api/* → Express API na :4000 (izbjegava CORS i hardkodirani host).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // host: true → slušaj na 0.0.0.0 (sve mreže), ne samo 127.0.0.1. Bez ovoga
    // Windows preglednik često ne vidi WSL2 dev server preko localhosta.
    host: true,
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
