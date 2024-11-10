import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// https://vitejs.dev/config
export default defineConfig({
  root: resolve(__dirname, "src", "main_window"),
  build: {
    outDir: resolve(__dirname, ".vite"),
  },
  plugins: [react()],
});
