import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 관련 라이브러리를 별도 청크로 분리
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          // 폼 관련 라이브러리
          "form-vendor": ["react-hook-form", "@hookform/resolvers", "zod"],
          // 쿼리 관련 라이브러리
          "query-vendor": ["@tanstack/react-query"],
          // PDF 생성 관련 라이브러리 (큰 용량)
          "pdf-vendor": ["jspdf", "html2canvas"],
        },
      },
    },
    // 청크 크기 경고 제한을 1000 kB로 상향 조정
    chunkSizeWarningLimit: 1000,
  },
});
