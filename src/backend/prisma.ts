import { PrismaClient } from "@prisma/client";
import { app, utilityProcess } from "electron";
import path from "node:path";
import log from "electron-log";

const prismaPath = path.join(app.getAppPath(), "../prisma/build/index.js");

const queryEnginePath = path.join(
  app.getAppPath(),
  "../@prisma/engines/libquery_engine-darwin-arm64.dylib.node"
);

const schemaEnginePath = path.join(
  app.getAppPath(),
  "../@prisma/engines/schema-engine-darwin-arm64"
);

export const dbPath = app.isPackaged
  ? // 本番環境だとmigrateしないとデータベースが存在しない
    path.resolve(app.getPath("userData"), "app.db")
  : // __dirnameは.vite/buildになる
    path.resolve(__dirname, "..", "..", "prisma", "dev.db");

export const dbUrl = `file:${dbPath}`;

export const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } },
  // @ts-expect-error internal prop
  __internal: {
    engine: {
      binaryPath: queryEnginePath,
    },
  },
});

// https://github.com/awohletz/electron-prisma-trpc-example/blob/bece9874370ace88d122f5ea8add85de89aced54/src/server/prisma.ts#L32
export const runPrismaCommand = async ({
  command,
  dbUrl,
}: {
  command: string[];
  dbUrl: string;
}) => {
  log.info("Schema engine path", schemaEnginePath);
  log.info("Query engine path", queryEnginePath);
  log.info("Prisma path", prismaPath);

  // Currently we don't have any direct method to invoke prisma migration programatically.
  // As a workaround, we spawn migration script as a child process and wait for its completion.
  // Please also refer to the following GitHub issue: https://github.com/prisma/prisma/issues/4703
  try {
    const exitCode = await new Promise((resolve, rejects) => {
      const child = utilityProcess.fork(prismaPath, command, {
        env: {
          ...process.env,
          DATABASE_URL: dbUrl,
          PRISMA_SCHEMA_ENGINE_BINARY: schemaEnginePath,
          PRISMA_QUERY_ENGINE_LIBRARY: queryEnginePath,
          PRISMA_FMT_BINARY: queryEnginePath,
          PRISMA_INTROSPECTION_ENGINE_BINARY: queryEnginePath,
        },
        stdio: "pipe",
      });
      log.info("PID: ", child.pid);

      child.on("message", (msg) => {
        log.info(msg);
      });

      child.on("error", (err) => {
        log.error("Child process got error:", err);
      });

      child.on("exit", (code) => {
        resolve(code);
      });

      child.stdout?.on("data", function (data) {
        log.info("prisma: ", data.toString());
      });

      child.stderr?.on("data", function (data) {
        log.error("prisma: ", data.toString());
        rejects();
      });
    });

    if (exitCode !== 0)
      throw Error(`command ${command} failed with exit code ${exitCode}`);

    return exitCode;
  } catch (e) {
    log.error(e);
    throw e;
  }
};
