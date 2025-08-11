// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react()], [svgr()],
  server: {
    host: true, // 기본적으로 'localhost'인데 true로 하면 모든 IP에서 접근 가능
    port: 5173, // 기본 포트. 필요하면 다른 포트로 변경 가능
  },
});

