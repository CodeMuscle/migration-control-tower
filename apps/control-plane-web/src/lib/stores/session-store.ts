"use client";

import { create } from "zustand";

interface SessionState {
  /** UUID of the tenant the user is currently scoped to (sent as X-Tenant-Id). */
  tenantId: string | null;
  setTenantId: (id: string | null) => void;
}

/**
 * Tiny client-side session store. The server state for /v1/me lives in
 * TanStack Query's cache; this store only holds the *currently-selected*
 * tenant id (sourced from Clerk's active org metadata) so non-React code
 * — specifically the apiClient — can read it synchronously per request.
 */
export const useSessionStore = create<SessionState>((set) => ({
  tenantId: null,
  setTenantId: (tenantId) => set({ tenantId }),
}));
