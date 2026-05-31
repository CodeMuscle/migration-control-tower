"use client";

import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

import { createApiClient, type ApiClient } from "./client";

import { useSessionStore } from "@/lib/stores/session-store";

/**
 * React-bound API client. Pulls a Clerk session token on each request and
 * the currently-active tenant id from the session store (which gets
 * populated by `useSessionBootstrap` from Clerk's active organization).
 */
export function useApiClient(): ApiClient {
  const { getToken } = useAuth();
  const tenantId = useSessionStore((s) => s.tenantId);

  return useMemo(
    () =>
      createApiClient({
        getToken: () => getToken(),
        tenantId: tenantId ?? "",
      }),
    [getToken, tenantId],
  );
}
