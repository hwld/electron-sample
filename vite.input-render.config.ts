import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  root: resolve(__dirname, "src", "input_panel"),
  build: {
    outDir: resolve(__dirname, ".vite", "renderer", "input_panel"),
  },
  plugins: [react()],
});
