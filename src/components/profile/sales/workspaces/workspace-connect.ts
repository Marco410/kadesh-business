export function workspaceConnectPayload(workspaceId: string | null): {
  workspace?: { connect: { id: string } };
} {
  if (workspaceId == null) return {};
  return { workspace: { connect: { id: workspaceId } } };
}
