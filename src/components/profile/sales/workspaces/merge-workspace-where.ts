export function mergeWorkspaceFilter<W extends Record<string, unknown>>(
  where: W,
  workspaceId: string | null
): W {
  if (workspaceId == null) return where;
  const workspaceClause = { workspace: { id: { equals: workspaceId } } };
  const keys = Object.keys(where);
  if (keys.length === 0) {
    return workspaceClause as unknown as W;
  }
  return { AND: [where, workspaceClause] } as unknown as W;
}
