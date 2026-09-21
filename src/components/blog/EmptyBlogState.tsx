"use client";

import { HugeiconsIcon } from '@hugeicons/react';
import { FileSearchIcon } from '@hugeicons/core-free-icons';

export default function EmptyBlogState() {
  return (
    <div className="flex flex-col justify-center items-center py-20 px-4">
      <div className="w-24 h-24 rounded-full bg-[#f5f5f5] dark:bg-[#1e1e1e] flex items-center justify-center mb-6">
        <HugeiconsIcon 
          icon={FileSearchIcon} 
          size={48} 
          className="text-[#616161] dark:text-[#b0b0b0]"
          strokeWidth={1.5}
        />
      </div>
      <h3 className="text-xl font-semibold text-[#212121] dark:text-[#ffffff] mb-2">
        No hay posts disponibles
      </h3>
      <p className="text-[#616161] dark:text-[#b0b0b0] text-center max-w-md">
        Por el momento no hay publicaciones para mostrar. Vuelve pronto para ver nuevo contenido.
      </p>
    </div>
  );
}

