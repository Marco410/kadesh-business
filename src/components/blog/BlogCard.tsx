"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    FavouriteIcon,
    BubbleChatIcon,
    Bookmark02Icon,
    Image01Icon,
    ViewIcon
} from '@hugeicons/core-free-icons';

import { BlogPost } from './types';
import { getCategoryLabel, getCategoryColors } from './constants';
import { Routes } from 'kadesh/core/routes';
import { useUser } from 'kadesh/utils/UserContext';
import { usePostFavorites } from './hooks/usePostFavorites';

interface BlogCardProps {
  post: BlogPost;
  index: number;
  showExcerpt?: boolean;
}

export default function BlogCard({ post, index, showExcerpt = true }: BlogCardProps) {
  const categoryValue = post.category?.name || '';
  const categoryLabel = getCategoryLabel(categoryValue);
  const categoryColors = getCategoryColors(categoryValue);

  const { user } = useUser();


  const {
    isFavorited,
    loading: favoritesLoading,
    isCreatingFavorite,
    isDeletingFavorite,
    handleFavorite,
  } = usePostFavorites(post.id);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="bg-[#f5f5f5] dark:bg-[#1e1e1e] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      <Link href={Routes.blog.post(post.url)}>
        <div className="relative w-full h-48 overflow-hidden bg-[#f5f5f5] dark:bg-[#1e1e1e]">
          {post.image?.url ? (
            <Image
              src={post.image.url}
              alt={post.title}
              fill
              className="object-cover hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <HugeiconsIcon 
                icon={Image01Icon} 
                size={64} 
                className="text-[#616161] dark:text-[#b0b0b0]"
                strokeWidth={1.5}
              />
            </div>
          )}
          
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <span className={`
              px-2.5 py-1 rounded-full text-xs font-semibold
              ${categoryColors.border}
              ${categoryColors.bg}
              ${categoryColors.text}
              dark:border-opacity-70
            `}>
              {categoryLabel}
            </span>
          </div>
        </div>
        
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs overflow-hidden">
              {post.author?.profileImage?.url ? (
                <Image
                  src={post.author.profileImage.url}
                  alt={post.author.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <span>{post.author?.name?.charAt(0) || 'A'}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-medium text-[#212121] dark:text-[#ffffff]">{post.author?.name || 'Autor'}</span>
              <span className="text-[#616161] dark:text-[#b0b0b0]">·</span>
              <span className="text-[#616161] dark:text-[#b0b0b0]">
                {post.publishedAt 
                  ? new Date(post.publishedAt).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' })
                  : new Date(post.createdAt).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' })
                }
              </span>
            </div>
          </div>
          
          <h3 className="text-base font-bold text-[#212121] dark:text-[#ffffff] mb-3 line-clamp-2 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
            {post.title}
          </h3>
          
          {showExcerpt && (
            <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mb-3 line-clamp-3"> {post.excerpt} </p>
          )}
          
          <div className="flex items-center gap-4 mt-auto pt-3">
            <div className="flex items-center gap-1.5 text-[#616161] dark:text-[#b0b0b0]">
              <HugeiconsIcon 
                icon={FavouriteIcon} 
                size={16} 
                className="text-[#616161] dark:text-[#b0b0b0]"
                strokeWidth={2}
              />
              <span className="text-xs">{post.post_likesCount || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#616161] dark:text-[#b0b0b0]">
              <HugeiconsIcon 
                icon={BubbleChatIcon} 
                size={16} 
                className="text-[#616161] dark:text-[#b0b0b0]"
                strokeWidth={2}
              />
              <span className="text-xs">{post.commentsCount || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#616161] dark:text-[#b0b0b0]">
              <HugeiconsIcon 
                icon={ViewIcon} 
                size={16} 
                className="text-[#616161] dark:text-[#b0b0b0]"
                strokeWidth={2}
              />
              <span className="text-xs">{post.post_viewsCount || 0}</span>
            </div>
            {user?.id && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFavorite();
                }}
                className={`ml-auto items-center gap-2 transition-colors ${
                  isFavorited 
                    ? "text-orange-500 dark:text-orange-400" 
                    : "text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400"
                } ${isCreatingFavorite || isDeletingFavorite || favoritesLoading ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
                aria-label="Guardar artículo"
              >
                <HugeiconsIcon
                  icon={Bookmark02Icon}
                  size={20}
                  className={isFavorited ? "text-orange-500 dark:text-orange-400" : ""}
                  strokeWidth={2}
                />
              </button>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

