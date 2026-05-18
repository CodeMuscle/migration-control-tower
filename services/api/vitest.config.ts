import { defineConfig } from "vitest/config";

// Integration tests spin a real Postgres (testcontainers) and run the
// committed Prisma migrations against it — keep them serial and give the
// container generous start-up time.
export default defineConfig({
  test: {
    include: ["test/**/*.spec.ts"],
    testTimeout: 120_000,
    hookTimeout: 180_000,
    fileParallelism: false,
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
  },
});
