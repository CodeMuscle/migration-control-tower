-- CreateTable
CREATE TABLE "validation_runs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "mapping_version_id" UUID NOT NULL,
    "source_snapshot_id" UUID NOT NULL,
    "destination_schema_id" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "rows_scanned" INTEGER NOT NULL DEFAULT 0,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "warning_count" INTEGER NOT NULL DEFAULT 0,
    "info_count" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "triggered_by" UUID NOT NULL,
    "started_at" TIMESTAMPTZ(6),
    "finished_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "validation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validation_issues" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "run_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "severity" VARCHAR(20) NOT NULL,
    "rule_key" VARCHAR(40) NOT NULL,
    "row_index" INTEGER NOT NULL,
    "source_field_key" VARCHAR(100),
    "destination_field_key" VARCHAR(100) NOT NULL,
    "message" TEXT NOT NULL,
    "sample_value" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'open',
    "resolution_note" TEXT,
    "resolved_at" TIMESTAMPTZ(6),
    "resolved_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "validation_issues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "validation_runs_tenant_id_project_id_created_at_idx" ON "validation_runs"("tenant_id", "project_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "validation_issues_tenant_id_project_id_status_created_at_idx" ON "validation_issues"("tenant_id", "project_id", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "validation_issues_tenant_id_run_id_severity_idx" ON "validation_issues"("tenant_id", "run_id", "severity");

-- CreateIndex
CREATE INDEX "validation_issues_tenant_id_project_id_destination_field_ke_idx" ON "validation_issues"("tenant_id", "project_id", "destination_field_key", "rule_key");

-- AddForeignKey
ALTER TABLE "validation_runs" ADD CONSTRAINT "validation_runs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_issues" ADD CONSTRAINT "validation_issues_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_issues" ADD CONSTRAINT "validation_issues_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "validation_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
