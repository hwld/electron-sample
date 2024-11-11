import { defineConfig } from "vite";
import copy from "rollup-plugin-copy";

export default defineConfig({
  plugins: [
    copy({
      targets: [
        {
          src: "node_modules/prisma",
          dest: ".vite/build/node_modules",
        },
        { src: "node_modules/.prisma", dest: ".vite/build/node_modules" },
        {
          src: "prisma/migrations",
          dest: ".vite/build/node_modules/.prisma/client",
        },
        { src: "node_modules/@prisma", dest: ".vite/build/node_modules" },
      ],
      hook: "writeBundle",
      copyOnce: true,
    }),
  ],
});
