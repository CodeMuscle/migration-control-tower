/**
 * Opaque keyset-pagination cursor. Encodes the last row's
 * (createdAt, id) so the next page is a stable `WHERE (created_at,id) < (…)`
 * keyset query — never OFFSET (which drifts and degrades on large tables).
 */
const SEP = "|";

export function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(`${createdAt.toISOString()}${SEP}${id}`).toString("base64url");
}

export function decodeCursor(cursor: string): { createdAt: Date; id: string } | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const idx = raw.lastIndexOf(SEP);
    if (idx < 0) return null;
    const createdAt = new Date(raw.slice(0, idx));
    const id = raw.slice(idx + 1);
    if (Number.isNaN(createdAt.getTime()) || !id) return null;
    return { createdAt, id };
  } catch {
    return null;
  }
}

/**
 * Run a keyset page. `fetch` is given the decoded cursor (or null for the
 * first page) and must return up to `limit + 1` rows ordered by
 * (createdAt desc, id desc). Returns the page (trimmed to `limit`) and the
 * next cursor (null when exhausted).
 */
export async function keysetPage<T extends { id: string; createdAt: Date }>(
  cursor: string | undefined,
  limit: number,
  fetch: (after: { createdAt: Date; id: string } | null, take: number) => Promise<T[]>,
): Promise<{ items: T[]; nextCursor: string | null }> {
  const after = cursor ? decodeCursor(cursor) : null;
  const rows = await fetch(after, limit + 1);
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items[items.length - 1];
  return {
    items,
    nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null,
  };
}
