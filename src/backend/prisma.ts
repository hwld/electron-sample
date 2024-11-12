import { PrismaClient } from "@prisma/client";
import { app, utilityProcess } from "electron";
import path from "node:path";
import log from "electron-log";

const prismaRoot = path.join(app.getAppPath(), ".vite/node_modules");

const prismaPath = path.join(prismaRoot, "prisma/build/index.js");

const schemaPath = path.join(prismaRoot, ".prisma/client/schema.prisma");

const queryEnginePath = path.join(
  prismaRoot,
  "@prisma/engines/libquery_engine-darwin-arm64.dylib.node"
);

const schemaEnginePath = path.join(
  prismaRoot,
  "@prisma/engines/schema-engine-darwin-arm64"
);

export const dbPath = app.isPackaged
  ? // 本番環境だとmigrateしないとデータベースが存在しない
    path.resolve(app.getPath("userData"), "app.db")
  : // __dirnameは.vite/buildになる
    path.resolve(__dirname, "..", "..", "prisma", "dev.db");

const dbUrl = `file:${dbPath}`;

export const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } },
});

// https://github.com/awohletz/electron-prisma-trpc-example/blob/bece9874370ace88d122f5ea8add85de89aced54/src/server/prisma.ts#L32
export const runPrismaMigrate = async () => {
  log.info("Schema engine path: ", schemaEnginePath);
  log.info("Query engine path: ", queryEnginePath);
  log.info("Prisma path: ", prismaPath);
  log.info("Schema path: ", schemaPath);

  // Currently we don't have any direct method to invoke prisma migration programatically.
  // As a workaround, we spawn migration script as a child process and wait for its completion.
  // Please also refer to the following GitHub issue: https://github.com/prisma/prisma/issues/4703
  try {
    const exitCode = await new Promise((resolve, rejects) => {
      // ここでmigrationが終了しても何故かプロセスが終了しない
      // utilityProcessではなくchid_process.forkを使うと無限ループしちゃう
      // https://github.com/electron/forge/issues/3686
      const child = utilityProcess.fork(
        prismaPath,
        ["migrate", "deploy", "--schema", schemaPath],
        {
          env: {
            DATABASE_URL: dbUrl,
            PRISMA_SCHEMA_ENGINE_BINARY: schemaEnginePath,
            PRISMA_QUERY_ENGINE_LIBRARY: queryEnginePath,
          },
          stdio: ["ignore", "pipe", "pipe"],
        }
      );

      child.on("message", (msg) => {
        log.info(msg);
      });

      child.on("error", (err) => {
        log.error("Child process got error:", err);
      });

      child.on("exit", (code) => {
        log.info("prisma: exit");
        resolve(code);
      });

      child.on("spawn", () => {
        log.debug("spawn: ", child.pid);
        child.addListener("exit", () => {
          log.debug("exit");
        });
      });

      child.stdout?.on("data", function (data) {
        log.info("prisma: ", data.toString());
      });

      child.stdout?.on("exit", function () {
        log.info("prisma: exit");
      });

      child.stderr?.on("data", function (data) {
        log.error("prisma: ", data.toString());
        rejects();
      });
    });

    log.info("Complete");

    return exitCode;
  } catch (e) {
    log.error(e);
    throw e;
  }
};
