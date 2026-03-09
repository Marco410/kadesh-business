"use client";

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
}: ConfirmModalProps) {
  const confirmButtonClasses = {
    red: 'bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600',
    orange: 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600',
    blue: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
          >
            <div 
              className="bg-[#ffffff] dark:bg-[#1e1e1e] rounded-2xl shadow-2xl max-w-lg w-full p-8 pointer-events-auto border border-[#e0e0e0] dark:border-[#3a3a3a]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
                <h3 className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] pr-4 flex-1">
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
                <p className="text-md text-[#616161] dark:text-[#b0b0b0] leading-relaxed">
                  {message}
                </p>
                {/* Two buttons layout: responsive (mobile: action first, then cancel below; desktop: side by side) */}
                <div className={`flex flex-col sm:flex-row gap-3 ${cancelText ? 'sm:justify-end' : 'sm:justify-center'}`}>
                  <button 
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`order-1 px-5 py-2.5 ${confirmButtonClasses[confirmButtonColor]} text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap hover:opacity-90 w-full sm:w-auto`}
                  >
                    {isLoading ? 'Procesando...' : confirmText}
                  </button>
                  {cancelText && (
                    <button 
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

