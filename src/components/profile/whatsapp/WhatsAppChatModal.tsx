"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ModalPortal } from "kadesh/components/shared";
import WhatsAppChatPanel from "./WhatsAppChatPanel";

export interface WhatsAppChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadName?: string;
}

export default function WhatsAppChatModal({
  isOpen,
  onClose,
  leadId,
  leadName,
}: WhatsAppChatModalProps) {
  return (
    <ModalPortal>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4"
              onClick={onClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="bg-[#ffffff] dark:bg-[#1e1e1e] rounded-2xl shadow-2xl max-w-lg w-full max-h-[min(90vh,700px)] flex flex-col overflow-hidden pointer-events-auto border border-[#e0e0e0] dark:border-[#3a3a3a]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start p-6 pb-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
                  <h3 className="text-xl font-bold text-[#212121] dark:text-[#ffffff] pr-4">
                    WhatsApp{leadName ? ` — ${leadName}` : ""}
                  </h3>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-2xl font-bold text-[#616161] dark:text-[#b0b0b0] hover:text-[#212121] dark:hover:text-[#ffffff] transition-colors flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
                    aria-label="Cerrar"
                  >
                    ×
                  </button>
                </div>

                <WhatsAppChatPanel
                  leadId={leadId}
                  active={isOpen}
                  className="min-h-0 flex-1"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}
