import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

function resolveDatabasePath(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl?.startsWith("file:")) {
    return resolve(process.cwd(), databaseUrl.slice("file:".length));
  }

  return resolve(process.cwd(), "dev.db");
}
const globalForSqlite = globalThis as typeof globalThis & {
  sqlite?: DatabaseSync;
};

export function getSqliteDb(): DatabaseSync {
  const sqlite = globalForSqlite.sqlite ?? new DatabaseSync(resolveDatabasePath());

  sqlite.exec("PRAGMA foreign_keys = ON");

  if (process.env.NODE_ENV !== "production") {
    globalForSqlite.sqlite = sqlite;
  }

  return sqlite;
}