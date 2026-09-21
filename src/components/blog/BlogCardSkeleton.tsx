"use client";

export default function BlogCardSkeleton() {
  return (
    <div className="bg-[#f5f5f5] dark:bg-[#1e1e1e] rounded-xl overflow-hidden animate-pulse flex flex-col">
      {/* Imagen skeleton */}
      <div className="relative w-full h-48 bg-gray-300 dark:bg-neutral-700"></div>
      
      {/* Contenido skeleton */}
      <div className="p-4 flex flex-col flex-1">
        {/* Autor y fecha skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-neutral-700"></div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-20 bg-gray-300 dark:bg-neutral-700 rounded"></div>
            <div className="h-3 w-1 bg-gray-300 dark:bg-neutral-700 rounded"></div>
            <div className="h-3 w-16 bg-gray-300 dark:bg-neutral-700 rounded"></div>
          </div>
        </div>
        
        {/* Título skeleton */}
        <div className="mb-3 space-y-2">
          <div className="h-4 w-full bg-gray-300 dark:bg-neutral-700 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-300 dark:bg-neutral-700 rounded"></div>
        </div>
        
        {/* Métricas skeleton */}
        <div className="flex items-center gap-4 mt-auto pt-3">
          <div className="h-4 w-8 bg-gray-300 dark:bg-neutral-700 rounded"></div>
          <div className="h-4 w-8 bg-gray-300 dark:bg-neutral-700 rounded"></div>
          <div className="ml-auto h-4 w-4 bg-gray-300 dark:bg-neutral-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}

