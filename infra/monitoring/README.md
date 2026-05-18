# `infra/monitoring/`

Observability stack configuration.

Placeholder — scaffolded to match the LLD's recommended repo structure
(`infra/{docker,terraform,monitoring}`). Per `tech-stack.csv` the observability
stack is OpenTelemetry + Grafana + Loki + Tempo + Sentry; collector configs,
dashboards, and alert rules land here alongside the Analytics module (#13) and
the cross-cutting observability work the LLD calls for (tenant-dimensioned
logs, metrics, and traces).
