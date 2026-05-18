# `infra/terraform/`

Infrastructure-as-code for non-local environments.

Placeholder — scaffolded to match the LLD's recommended repo structure
(`infra/{docker,terraform,monitoring}`). Local development uses
[`../docker/docker-compose.yml`](../docker/docker-compose.yml); this directory
will hold the Terraform modules for the deploy target chosen from
`tech-stack.csv` (Render / Fly / AWS) when the deployment module is built.
