/**
 * Prisma 7 config — the schema no longer carries `url`. This file gives the
 * `prisma` CLI (migrate / studio / db) its connection via the
 * @prisma/adapter-pg driver adapter; runtime PrismaClient construction is
 * in `src/index.ts`. `DATABASE_URL` is loaded from `packages/db/.env`
 * (gitignored) when present.
 */
import "dotenv/config";
import path from "node:path";

import { defineConfig } from "prisma/config";

// Prisma 7 wants connection config in this file (not the schema). The CLI
// (migrate / studio / db) uses `datasource.url`; the runtime PrismaClient in
// `src/index.ts` uses @prisma/adapter-pg backed by a shared `pg` Pool.
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
