import { is } from "@electron-toolkit/utils";
import { PrismaClient } from "@prisma/client";
import { app } from "electron";
import { join, resolve } from "path";
import log from "electron-log";
import { fork } from "child_process";
import fs from "fs";

// electron-builder.ymlのextraResoucesに影響を受ける
const prismaRoot = join(app.getAppPath().replace("app.asar", ""), "node_modules");

const schemaEnginePath = join(prismaRoot, "@prisma/engines/schema-engine-darwin-arm64");
const queryEnginePath = join(prismaRoot, "@prisma/engines/libquery_engine-darwin-arm64.dylib.node");
const cliPath = join(prismaRoot, "prisma/build/index.js");

const schemaPath = join(
  app.getAppPath().replace("app.asar", "app.asar.unpacked"),
  "prisma/schema.prisma"
);

const dbPath = is.dev
  ? // 開発環境だと__dirnameは .out/main
    resolve(__dirname, "../../prisma/dev.db")
  : resolve(app.getPath("userData"), "app.db");
const dbUrl = `file:${dbPath}`;

export const db = new PrismaClient({ datasources: { db: { url: dbUrl } } });

type Migration = {
  id: string;
  checksum: string;
  finished_at: string;
  migration_name: string;
  logs: string;
  rolled_back_at: string;
  started_at: string;
  applied_steps_count: string;
};

// migrationを作成するたびにここを更新する
export const latestMigration = "20241112170343_";

export async function migrate(): Promise<void> {
  const needsMigration = await isMigrationNeeded();

  if (needsMigration) {
    try {
      await runMigrateCommand();
      log.info("Migration done.");
    } catch (e) {
      log.error(e);
      process.exit(1);
    }
  } else {
    log.info("Does not need migration");
  }
}

async function isMigrationNeeded(): Promise<boolean> {
  const dbExists = fs.existsSync(dbPath);
  if (!dbExists) {
    // prisma for whatever reason has trouble if the database file does not exist yet.
    // So just touch it here
    // fs.closeSync(fs.openSync(dbPath, "w"));
    return true;
  } else {
    try {
      const latest: Migration[] =
        await db.$queryRaw`select * from _prisma_migrations order by finished_at`;
      return latest[latest.length - 1]?.migration_name !== latestMigration;
    } catch (e) {
      log.error(e);
      return true;
    }
  }
}

async function runMigrateCommand(): Promise<number> {
  log.info(`Migration engine path: ${schemaEnginePath}`);
  log.info(`QUery engine path: ${queryEnginePath}`);
  log.info(`PrismaCLI path: ${cliPath}`);

  try {
    const exitCode = await new Promise((resolve) => {
      const child = fork(cliPath, ["migrate", "deploy", "--schema", schemaPath], {
        env: {
          ...process.env,
          DATABASE_URL: dbUrl,
          PRISMA_SCHEMA_ENGINE_BINARY: schemaEnginePath,
          PRISMA_QUERY_ENGINE_LIBRARY: queryEnginePath
        },
        stdio: "pipe"
      });

      child.on("message", (msg) => {
        log.info(msg);
      });

      child.on("error", (err) => {
        log.error("Child process got error:", err);
      });

      child.on("close", (code) => {
        resolve(code);
      });

      child.stdout?.on("data", function (data) {
        log.info("prisma: ", data.toString());
      });

      child.stderr?.on("data", function (data) {
        log.error("prisma: ", data.toString());
      });
    });

    if (exitCode !== 0) throw Error(`Migration failed with exit code ${exitCode}`);

    return exitCode;
  } catch (e) {
    log.error(e);
    throw e;
  }
}
