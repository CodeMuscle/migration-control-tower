import { Controller, Get } from "@nestjs/common";

import { Public } from "../common/decorators.js";

@Controller()
export class HealthController {
  /** Liveness probe. Public — no auth, no tenant. */
  @Public()
  @Get("health")
  health(): { status: "ok"; uptime: number } {
    return { status: "ok", uptime: Math.round(process.uptime()) };
  }
}
