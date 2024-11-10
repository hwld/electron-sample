import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  root: resolve(__dirname, "src", "main_window"),
  build: {
    // https://github.com/electron/forge/blob/v7.5.0/packages/plugin/vite/src/config/vite.renderer.config.ts
    // デフォルトの設定では、`.vite/renderer/...`と設定されているが、rootを変えると位置がずれるので設定し直す
    outDir: resolve(__dirname, ".vite", "renderer", "main_window"),
  },
  plugins: [react()],
});
