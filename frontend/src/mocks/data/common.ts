// Common mock data utilities

export const TENANT_ID = '11111111-1111-1111-1111-111111111111'

/**
 * Generate a deterministic UUID-like string from a prefix and sequential number.
 * Example: uuid('acct', 1) => 'acct0000-0000-0000-0000-000000000001'
 */
export function uuid(prefix: string, n: number): string {
  const padded = String(n).padStart(12, '0')
  const pfx = prefix.substring(0, 8).padEnd(8, '0')
  return `${pfx}-0000-0000-0000-${padded}`
}

/**
 * Paginate an array of items, returning a PaginatedResult shape.
 */
export function paginate<T>(
  items: T[],
  page = 1,
  pageSize = 20,
): { items: T[]; page: number; pageSize: number; totalCount: number; totalPages: number } {
  const totalCount = items.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const start = (page - 1) * pageSize
  const end = start + pageSize

  return {
    items: items.slice(start, end),
    page,
    pageSize,
    totalCount,
    totalPages,
  }
}
