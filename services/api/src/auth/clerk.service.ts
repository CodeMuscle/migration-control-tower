/**
 * Thin wrapper over @clerk/backend. Verifies session tokens and resolves the
 * Clerk user's primary email, which is how a Clerk identity is linked to the
 * local `users` row (by email). Requires CLERK_SECRET_KEY.
 */
import { createClerkClient, verifyToken } from "@clerk/backend";
import type { ClerkClient } from "@clerk/backend";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class ClerkService {
  private readonly logger = new Logger(ClerkService.name);
  private readonly secretKey = process.env.CLERK_SECRET_KEY ?? "";
  private readonly client: ClerkClient;

  constructor() {
    if (!this.secretKey) {
      this.logger.warn(
        "CLERK_SECRET_KEY is not set — all authenticated requests will fail with AUTH_REQUIRED",
      );
    }
    this.client = createClerkClient({ secretKey: this.secretKey });
  }

  /** Verify a bearer token; returns the Clerk user id (`sub`) or null. */
  async verifyUserId(token: string): Promise<string | null> {
    if (!this.secretKey) return null;
    try {
      const payload = await verifyToken(token, { secretKey: this.secretKey });
      return typeof payload.sub === "string" ? payload.sub : null;
    } catch (err) {
      this.logger.debug({ err }, "token verification failed");
      return null;
    }
  }

  /** Primary email for a Clerk user id, or null. */
  async primaryEmail(clerkUserId: string): Promise<string | null> {
    try {
      const user = await this.client.users.getUser(clerkUserId);
      const primary = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId);
      return primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
    } catch (err) {
      this.logger.debug({ err }, "clerk getUser failed");
      return null;
    }
  }
}
