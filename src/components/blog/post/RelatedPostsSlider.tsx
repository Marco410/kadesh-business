"use client";

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeftIcon, ArrowRightIcon } from '@hugeicons/core-free-icons';
import { useRelatedPosts } from '../hooks/useRelatedPosts';
import BlogCard from '../BlogCard';
import BlogCardSkeleton from '../BlogCardSkeleton';
import { BlogPostDetail } from '../types';

interface RelatedPostsSliderProps {
  currentPost: BlogPostDetail;
}

export default function RelatedPostsSlider({ currentPost }: RelatedPostsSliderProps) {
  const { relatedPosts, loading } = useRelatedPosts({
    currentPostId: currentPost.id,
    tags: currentPost.tags,
    categoryUrl: currentPost.category?.url,
    limit: 8,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 640px)': { slidesToScroll: 2 },
      '(min-width: 1024px)': { slidesToScroll: 3 },
    },
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    const updateScrollButtons = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    updateScrollButtons();
    emblaApi.on('select', updateScrollButtons);
    emblaApi.on('reInit', updateScrollButtons);

    return () => {
      emblaApi.off('select', updateScrollButtons);
      emblaApi.off('reInit', updateScrollButtons);
    };
  }, [emblaApi]);

  if (loading) {
    return (
      <section className="mb-12 mt-12">
        <h2 className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mb-6">
          Posts relacionados
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <BlogCardSkeleton key={index} />
          ))}
        </div>
      </section>
    );
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="mb-12 mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#212121] dark:text-[#ffffff]">
          Posts relacionados
        </h2>
        <div className="flex gap-2">
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="p-2 rounded-lg bg-[#f5f5f5] dark:bg-[#1e1e1e] text-[#212121] dark:text-[#ffffff] hover:bg-[#e0e0e0] dark:hover:bg-[#3a3a3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-[#e0e0e0] dark:border-[#3a3a3a]"
            aria-label="Anterior"
          >
            <HugeiconsIcon icon={ArrowLeftIcon} size={20} />
          </button>
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="p-2 rounded-lg bg-[#f5f5f5] dark:bg-[#1e1e1e] text-[#212121] dark:text-[#ffffff] hover:bg-[#e0e0e0] dark:hover:bg-[#3a3a3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-[#e0e0e0] dark:border-[#3a3a3a]"
            aria-label="Siguiente"
          >
            <HugeiconsIcon icon={ArrowRightIcon} size={20} />
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {relatedPosts.map((post, index) => (
              <div
                key={post.id}
                className="flex-[0_0_100%] sm:flex-[0_0_48%] lg:flex-[0_0_32%] min-w-0"
              >
                <BlogCard post={post} index={index} showExcerpt={false} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

