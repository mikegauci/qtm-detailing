export function getRelation<T>(relation: T | T[] | null | undefined): T | null {
  if (!relation) return null;
  if (Array.isArray(relation)) return relation[0] ?? null;
  return relation;
}

export function getCustomerRelation(
  relation:
    | { full_name: string; email?: string }
    | { full_name: string; email?: string }[]
    | null
    | undefined,
) {
  return getRelation(relation);
}
