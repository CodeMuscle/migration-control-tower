"use client";

import { useQuery } from "@tanstack/react-query";

import { useApiClient } from "./use-api-client";

import { useSessionStore } from "@/lib/stores/session-store";

export interface MeResponse {
  user: { id: string; email: string; fullName: string };
  tenant: { id: string; name: string };
  roles: string[];
}

export function useMe() {
  const api = useApiClient();
  const tenantId = useSessionStore((s) => s.tenantId);
  return useQuery({
    queryKey: ["me", tenantId],
    queryFn: () => api.get<MeResponse>("/v1/me"),
    enabled: !!tenantId,
    staleTime: 60_000,
  });
}
