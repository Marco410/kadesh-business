"use client";

import { useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  confirmButtonColor?: 'red' | 'orange' | 'blue';
  stackedOverModal?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  confirmButtonColor = 'red',
  stackedOverModal = false,
}: ConfirmModalProps) {
  const titleId = useId();
  const messageId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  // Like the browser's confirm(): Escape cancels and the focus starts on a button, so the keyboard
  // and screen readers land in the dialog (the panel's DashModal does this on its own).
  const closeRef = useRef(onClose);
  const busyRef = useRef(isLoading);
  useEffect(() => {
    closeRef.current = onClose;
    busyRef.current = isLoading;
  });
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => (cancelRef.current ?? confirmRef.current)?.focus(), 0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busyRef.current) {
        event.stopPropagation();
        closeRef.current();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKey, true);
      previous?.focus?.();
    };
  }, [isOpen]);
  const backdropZ = stackedOverModal ? 'z-[140]' : 'z-50';
  const dialogZ = stackedOverModal ? 'z-[145]' : 'z-[60]';

  const confirmButtonClasses = {
    red: 'bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600',
    orange: 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600',
    blue: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div data-body-scroll-lock 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 ${backdropZ}`}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed inset-0 flex items-center justify-center p-4 pointer-events-none ${dialogZ}`}
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={messageId}
              className="bg-[#ffffff] dark:bg-[#1e1e1e] rounded-2xl shadow-2xl max-w-lg w-full p-8 pointer-events-auto border border-[#e0e0e0] dark:border-[#3a3a3a]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
                <h3 id={titleId} className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] pr-4 flex-1">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="text-2xl font-bold text-[#616161] dark:text-[#b0b0b0] hover:text-[#212121] dark:hover:text-[#ffffff] transition-colors flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
                  disabled={isLoading}
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>
              <div className="flex flex-col gap-6">
                <p id={messageId} className="text-md text-[#616161] dark:text-[#b0b0b0] leading-relaxed">
                  {message}
                </p>
                <div className={`flex flex-col sm:flex-row gap-3 ${cancelText ? 'sm:justify-end' : 'sm:justify-center'}`}>
                  <button
                    ref={confirmRef}
                    type="button"
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`order-1 px-5 py-2.5 ${confirmButtonClasses[confirmButtonColor]} text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap hover:opacity-90 w-full sm:w-auto`}
                  >
                    {isLoading ? 'Procesando...' : confirmText}
                  </button>
                  {cancelText && (
                    <button
                      ref={cancelRef}
                      type="button"
                      onClick={onClose}
                      disabled={isLoading}
                      className="order-2 px-5 py-2.5 border-2 border-[#e0e0e0] dark:border-[#3a3a3a] text-[#212121] dark:text-[#ffffff] font-semibold rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap w-full sm:w-auto"
                    >
                      {cancelText}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

