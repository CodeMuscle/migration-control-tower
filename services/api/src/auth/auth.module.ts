/**
 * Auth module. Registers the AuthGuard as a global guard (APP_GUARD) so every
 * route is protected unless it opts out with @Public().
 */
import { Global, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";

import { AuthGuard } from "./auth.guard.js";
import { ClerkService } from "./clerk.service.js";

@Global()
@Module({
  providers: [ClerkService, { provide: APP_GUARD, useClass: AuthGuard }],
  exports: [ClerkService],
})
export class AuthModule {}
