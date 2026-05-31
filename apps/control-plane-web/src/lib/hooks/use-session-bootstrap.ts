"use client";

import { useOrganization } from "@clerk/nextjs";
import { useEffect } from "react";

import { useSessionStore } from "@/lib/stores/session-store";

/**
 * Mirrors Clerk's active organization's `publicMetadata.tenantId` into
 * the session store. Runs once on mount and any time the user switches
 * orgs in the OrganizationSwitcher.
 */
export function useSessionBootstrap() {
  const { organization, isLoaded } = useOrganization();
  const setTenantId = useSessionStore((s) => s.setTenantId);

  useEffect(() => {
    if (!isLoaded) return;
    const fromClerk = organization?.publicMetadata?.tenantId;
    setTenantId(typeof fromClerk === "string" ? fromClerk : null);
  }, [isLoaded, organization, setTenantId]);
}
