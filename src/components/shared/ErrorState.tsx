"use client";

import { HugeiconsIcon } from '@hugeicons/react';
import { WifiError01Icon } from '@hugeicons/core-free-icons';

interface ErrorStateProps {
  message?: string;
  title?: string;
  onRetry?: () => void;
}

export default function ErrorState({ 
  message = 'Error al cargar los datos',
  title = 'Error de conexión',
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col justify-center items-center py-20 px-4">
      <div className="w-24 h-24 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center mb-6">
        <HugeiconsIcon 
          icon={WifiError01Icon} 
          size={48} 
          className="text-yellow-500 dark:text-yellow-400"
          strokeWidth={1.5}
        />
      </div>
      <h3 className="text-xl font-semibold text-[#212121] dark:text-[#ffffff] mb-2">
        {title}
      </h3>
      <p className="text-[#616161] dark:text-[#b0b0b0] text-center max-w-md mb-6">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}

