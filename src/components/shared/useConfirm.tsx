"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import ConfirmModal from "./ConfirmModal";
import ModalPortal from "./ModalPortal";

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  /** Red for actions that remove or cannot be undone (the default); blue otherwise. */
  tone?: "danger" | "neutral";
};

/**
 * The panel's replacement for `window.confirm()`: same one-line use, but with our ConfirmModal
 * (it does not freeze the tab, reads well and works with the keyboard).
 *
 *   const [confirm, confirmDialog] = useConfirm();
 *   if (!(await confirm({ title: "Borrar nota", message: "¿Borrar esta nota?" }))) return;
 *   …
 *   return <>{…}{confirmDialog}</>;
 *
 * It answers false when the person cancels, presses Escape or clicks outside.
 */
export function useConfirm(): [(options: ConfirmOptions) => Promise<boolean>, ReactNode] {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((answer: boolean) => void) | null>(null);

  const settle = useCallback((answer: boolean) => {
    resolver.current?.(answer);
    resolver.current = null;
    setOptions(null);
  }, []);

  const confirm = useCallback((next: ConfirmOptions) => {
    // A second question while one is open answers the first with "no".
    resolver.current?.(false);
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const dialog = (
    <ModalPortal>
      <ConfirmModal
        isOpen={options !== null}
        onClose={() => settle(false)}
        onConfirm={() => settle(true)}
        title={options?.title ?? ""}
        message={options?.message ?? ""}
        confirmText={options?.confirmText ?? "Confirmar"}
        cancelText={options?.cancelText ?? "Cancelar"}
        confirmButtonColor={options?.tone === "neutral" ? "blue" : "red"}
        stackedOverModal
      />
    </ModalPortal>
  );

  return [confirm, dialog];
}
