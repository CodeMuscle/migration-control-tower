/**
 * Common API response envelope. EVERY HTTP endpoint in services/api returns
 * this shape — never a bare resource. (See CLAUDE.md → Coding conventions.)
 *
 * ⚠️ INFERRED shape — confirm against /docs/design/database-blueprint.docx.
 */

/** Machine-readable, screaming-snake error codes, e.g. `TENANT_NOT_FOUND`. */
export type ApiErrorCode = string;

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  /** Field-level or contextual detail; safe to surface to API clients. */
  details?: unknown;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface ApiMeta {
  /** Correlation id; also emitted on logs and in the `x-request-id` header. */
  requestId: string;
  /** Resolved tenant for the request, or null for unauthenticated routes. */
  tenantId: string | null;
  /** ISO-8601 server timestamp. */
  timestamp: string;
  pagination?: PaginationMeta;
}

export interface ApiSuccess<TData> {
  data: TData;
  error: null;
  meta: ApiMeta;
}

export interface ApiFailure {
  data: null;
  error: ApiError;
  meta: ApiMeta;
}

export type ApiEnvelope<TData> = ApiSuccess<TData> | ApiFailure;

export const ok = <TData>(data: TData, meta: ApiMeta): ApiSuccess<TData> => ({
  data,
  error: null,
  meta,
});

export const fail = (error: ApiError, meta: ApiMeta): ApiFailure => ({
  data: null,
  error,
  meta,
});
