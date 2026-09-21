"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCategories } from './hooks/useCategories';
import { ErrorState } from '../shared';
import { HugeiconsIcon } from '@hugeicons/react';
import { Image01Icon } from '@hugeicons/core-free-icons';
import { getCategoryLabel, getCategoryColors } from './constants';
import { Routes } from 'kadesh/core/routes';

export default function CategorySection() {
  const { categories, loading, error } = useCategories();

  if (loading) {
    return (
      <section className="bg-[#ffffff] dark:bg-[#121212] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-6 overflow-x-auto pb-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center gap-4 min-w-[140px] animate-pulse">
                <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-[#ffffff] dark:bg-[#121212] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ErrorState 
            message={error?.message || 'Error desconocido al cargar las categorías'}
            title="Error al cargar las categorías"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#ffffff] dark:bg-[#121212] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-3xl font-bold text-[#212121] dark:text-[#ffffff]"
          >
            Explora por categoría
          </motion.h2>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {categories.map((category, index) => {
            const categoryValue = category.name || '';
            const categoryLabel = getCategoryLabel(categoryValue);
            const categoryColors = getCategoryColors(categoryValue);
            
            return (
              <Link
                key={category.id}
                href={`${Routes.blog.index}?category=${category.url}`}
                className="flex flex-col items-center gap-4 min-w-[140px] cursor-pointer group"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex flex-col items-center gap-4 w-full"
                >
                  <div className={`w-32 h-32 rounded-full bg-[#f5f5f5] dark:bg-[#1e1e1e] flex items-center justify-center overflow-hidden border-2 ${categoryColors.border} group-hover:border-orange-500 dark:group-hover:border-orange-500 transition-colors`}>
                    {category.image?.url ? (
                      <div className="relative w-28 h-28 rounded-full overflow-hidden">
                        <Image
                          src={category.image.url}
                          alt={categoryLabel}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <HugeiconsIcon 
                          icon={Image01Icon} 
                          size={48} 
                          className="text-[#616161] dark:text-[#b0b0b0]"
                          strokeWidth={1.5}
                        />
                      </div>
                    )}
                  </div>
                  <span className="text-base font-semibold text-center group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                    {categoryLabel}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

