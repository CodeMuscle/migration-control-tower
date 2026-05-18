/**
 * Integration tests — real Postgres via testcontainers, the committed Prisma
 * migrations, and the real tenant-scoped client. Covers the three guarantees
 * the brief calls out: tenant-scoping isolation, stage-machine enforcement,
 * and per-tenant project_code uniqueness.
 *
 * Services are exercised directly (constructed with lightweight stand-ins for
 * the Nest-injected EventBus/PinoLogger) so the test targets data behaviour,
 * not the HTTP wiring (which the envelope interceptor/filter cover).
 */
import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PostgreSqlContainer } from "@testcontainers/postgresql";
import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

let container: StartedPostgreSqlContainer;
// Loaded dynamically AFTER DATABASE_URL points at the container.
let db: typeof import("@migrationtower/db");
let ProjectsService: typeof import("../dist/projects/projects.service.js").ProjectsService;

const noopLogger = {
  info() {},
  debug() {},
  warn() {},
  error() {},
  trace() {},
} as unknown as ConstructorParameters<typeof ProjectsService>[2];
const noopEvents = {
  publish: async () => {},
} as unknown as ConstructorParameters<typeof ProjectsService>[1];

function serviceFor(tenantId: string) {
  const prismaStub = {
    base: db.prisma,
    tenant: db.prismaForTenant(tenantId),
  } as unknown as ConstructorParameters<typeof ProjectsService>[0];
  return new ProjectsService(prismaStub, noopEvents, noopLogger);
}

const tenantA = randomUUID();
const tenantB = randomUUID();
const userA = randomUUID();
const userB = randomUUID();
const ctxA = { tenantId: tenantA, userId: userA, roles: ["owner"] };
const ctxB = { tenantId: tenantB, userId: userB, roles: ["owner"] };

beforeAll(async () => {
  container = await new PostgreSqlContainer("postgres:16-alpine").start();
  process.env.DATABASE_URL = container.getConnectionUri();

  const env = { ...process.env, DATABASE_URL: process.env.DATABASE_URL };
  // Build deps + api (so the dist we import matches source) and apply
  // migrations to the fresh container.
  execSync("pnpm --filter @migrationtower/db build", { cwd: repoRoot, env, stdio: "inherit" });
  execSync("pnpm --filter @migrationtower/db exec prisma migrate deploy", {
    cwd: repoRoot,
    env,
    stdio: "inherit",
  });
  execSync("pnpm --filter @migrationtower/api build", { cwd: repoRoot, env, stdio: "inherit" });

  db = await import("@migrationtower/db");
  ({ ProjectsService } = await import("../dist/projects/projects.service.js"));

  // Minimal fixtures: two tenants, one user each (FK targets for
  // ownerUserId/changedBy/actorUserId).
  await db.prisma.tenant.createMany({
    data: [
      {
        id: tenantA,
        name: "Tenant A",
        slug: "tenant-a",
        plan: "growth",
        status: "active",
        primaryRegion: "ap-south-1",
      },
      {
        id: tenantB,
        name: "Tenant B",
        slug: "tenant-b",
        plan: "growth",
        status: "active",
        primaryRegion: "ap-south-1",
      },
    ],
  });
  await db.prisma.user.createMany({
    data: [
      { id: userA, email: "a@example.com", fullName: "User A", status: "active" },
      { id: userB, email: "b@example.com", fullName: "User B", status: "active" },
    ],
  });
});

afterAll(async () => {
  await db?.prisma.$disconnect();
  await container?.stop();
});

describe("project_code uniqueness (per tenant)", () => {
  it("rejects a duplicate code in the same tenant but allows it across tenants", async () => {
    const svcA = serviceFor(tenantA);
    const svcB = serviceFor(tenantB);
    const base = {
      name: "Proj",
      customerName: "Cust",
      projectCode: "DUP-001",
      migrationType: "file" as const,
      targetProductType: "crm",
      targetEnvironment: "sandbox" as const,
      ownerUserId: userA,
    };

    await svcA.create(ctxA, base, "req-1");
    await expect(svcA.create(ctxA, base, "req-2")).rejects.toMatchObject({
      code: "CONFLICT",
    });
    // Same code, different tenant → allowed.
    await expect(
      svcB.create(ctxB, { ...base, ownerUserId: userB }, "req-3"),
    ).resolves.toMatchObject({ projectCode: "DUP-001" });
  });
});

describe("stage state machine (server-enforced)", () => {
  it("rejects an illegal jump and accepts the legal next stage", async () => {
    const svcA = serviceFor(tenantA);
    const project = await svcA.create(
      ctxA,
      {
        name: "SM",
        customerName: "Cust",
        projectCode: "SM-001",
        migrationType: "file",
        targetProductType: "crm",
        targetEnvironment: "sandbox",
        ownerUserId: userA,
      },
      "req",
    );

    // setup → mapping skips ingestion → rejected.
    await expect(
      svcA.advanceStage(ctxA, project.id, { toStage: "mapping" }, "req"),
    ).rejects.toMatchObject({ code: "CONFLICT" });

    // setup → ingestion is legal.
    const ok = await svcA.advanceStage(
      ctxA,
      project.id,
      { toStage: "ingestion", reason: "files uploaded" },
      "req",
    );
    expect(ok).toMatchObject({ currentStage: "ingestion", status: "active" });

    // any stage → blocked (side-branch).
    const blocked = await svcA.advanceStage(
      ctxA,
      project.id,
      { toStage: "blocked", reason: "client paused" },
      "req",
    );
    expect(blocked.status).toBe("blocked");
  });
});

describe("tenant-scoping isolation", () => {
  it("a project from tenant B is not visible to tenant A (404)", async () => {
    const svcB = serviceFor(tenantB);
    const svcA = serviceFor(tenantA);
    const projB = await svcB.create(
      ctxB,
      {
        name: "Secret",
        customerName: "Cust",
        projectCode: "ISO-001",
        migrationType: "file",
        targetProductType: "crm",
        targetEnvironment: "sandbox",
        ownerUserId: userB,
      },
      "req",
    );

    await expect(svcA.get(ctxA, projB.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
      httpStatus: 404,
    });
  });
});
