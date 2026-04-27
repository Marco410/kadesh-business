export const WORKSPACE_CRM_CARD_DRAG_MIME = "application/x-kadesh-workspace-crm-card";

export type WorkspaceCrmCardDragPayload = {
  entity: "tech" | "act" | "tasks" | "props";
  id: string;
};

export function setWorkspaceCrmDragData(
  dataTransfer: DataTransfer,
  payload: WorkspaceCrmCardDragPayload
) {
  dataTransfer.setData(WORKSPACE_CRM_CARD_DRAG_MIME, JSON.stringify(payload));
  dataTransfer.effectAllowed = "move";
}

export function readWorkspaceCrmDragPayload(
  dataTransfer: DataTransfer
): WorkspaceCrmCardDragPayload | null {
  try {
    const raw = dataTransfer.getData(WORKSPACE_CRM_CARD_DRAG_MIME);
    if (!raw) return null;
    const v = JSON.parse(raw) as WorkspaceCrmCardDragPayload;
    if (
      v &&
      typeof v.id === "string" &&
      (v.entity === "tech" ||
        v.entity === "act" ||
        v.entity === "tasks" ||
        v.entity === "props")
    ) {
      return v;
    }
  } catch {
    /* invalid */
  }
  return null;
}
