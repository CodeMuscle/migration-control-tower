import { defineConfig } from "vitest/config";

// Integration test spins a real Postgres (testcontainers) + builds the
// workspace; keep it serial with generous timeouts.
export default defineConfig({
  test: {
    include: ["test/**/*.spec.ts"],
    testTimeout: 240_000,
    hookTimeout: 240_000,
    fileParallelism: false,
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
  },
});
