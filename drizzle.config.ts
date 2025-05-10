import type { Config } from "drizzle-kit";
import { resolve } from "path";

export default {
  schema: "./app/lib/db/schema.ts",
  out: "./drizzle/migrations",
  driver: "libsql",
  dialect: "sqlite",
  dbCredentials: {
    url: resolve(process.cwd(), "data/sqlite.db"),
  },
} satisfies Config;
