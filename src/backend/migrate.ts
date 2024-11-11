import fs from "node:fs";
import { dbPath, dbUrl, prisma, runPrismaCommand } from "./prisma";
import path from "node:path";
import { app } from "electron";
import log from "electron-log";

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
export const latestMigration = "20241111104025_";

//https://github.com/awohletz/electron-prisma-trpc-example/blob/bece9874370ace88d122f5ea8add85de89aced54/src/server/main.ts#L13
export const migrate = async () => {
  const needsMigration = await isMigrationNeeded();

  if (needsMigration) {
    try {
      const schemaPath = path.join(
        app.getAppPath(),
        "../.prisma/client/schema.prisma"
      );
      log.info(
        `Needs a migration. Running prisma migrate with schema path ${schemaPath}`
      );

      await runPrismaCommand({
        command: ["migrate", "deploy", "--schema", schemaPath],
        dbUrl,
      });
      log.info("Migration done.");
    } catch (e) {
      log.error(e);
      process.exit(1);
    }
  } else {
    log.info("Does not need migration");
  }
};

const isMigrationNeeded = async () => {
  const dbExists = fs.existsSync(dbPath);
  if (!dbExists) {
    // prisma for whatever reason has trouble if the database file does not exist yet.
    // So just touch it here
    // fs.closeSync(fs.openSync(dbPath, "w"));
    return true;
  } else {
    try {
      const latest: Migration[] =
        await prisma.$queryRaw`select * from _prisma_migrations order by finished_at`;
      return latest[latest.length - 1]?.migration_name !== latestMigration;
    } catch (e) {
      log.error(e);
      return true;
    }
  }
};
