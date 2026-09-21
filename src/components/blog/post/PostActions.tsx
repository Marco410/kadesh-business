"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FavouriteIcon,
  BubbleChatIcon,
  Bookmark02Icon,
  ViewIcon,
  ShareIcon,
} from '@hugeicons/core-free-icons';
import { usePostLikes } from '../hooks/usePostLikes';
import { usePostComments } from '../hooks/usePostComments';
import { usePostFavorites } from '../hooks/usePostFavorites';
import { SITE_URL } from 'kadesh/core/site';
import { useUser } from 'kadesh/utils/UserContext';
import ConfirmModal from 'kadesh/components/shared/ConfirmModal';
import { Routes } from 'kadesh/core/routes';

interface PostActionsProps {
  postId: string;
  viewsCount: number;
  postUrl?: string;
  postTitle?: string;
}

export default function PostActions({ postId, viewsCount, postUrl, postTitle }: PostActionsProps) {
  const router = useRouter();
  const { user } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const {
    likesCount,
    isLiked,
    loading: likesLoading,
    isCreatingLike,
    isDeletingLike,
    handleLike,
  } = usePostLikes(postId);

  const { commentsCount } = usePostComments(postId);

  const {
    isFavorited,
    loading: favoritesLoading,
    isCreatingFavorite,
    isDeletingFavorite,
    handleFavorite,
  } = usePostFavorites(postId);

  const handleLikeClick = () => {
    if (!user?.id) {
      setShowAuthModal(true);
      return;
    }
    handleLike();
  };

  const handleGoToAuth = () => {
    setShowAuthModal(false);
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    router.push(`${Routes.auth.login}?redirect=${currentPath}&tab=register`);
  };

  const handleCommentsClick = () => {
    const commentsSection = document.getElementById('comments-section');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleShare = async () => {
    const baseUrl = SITE_URL;
    const url = postUrl 
      ? `${baseUrl}${postUrl.startsWith('/') ? postUrl : `/${postUrl}`}`
      : typeof window !== 'undefined' 
        ? window.location.href 
        : '';
    
    const title = postTitle || 'Artículo de KADESH';
    const text = `¡Hola! Encontré este artículo en KADESH y pensé que podría gustarte. 🌟\n\n ${title}\nDale un vistazo :)`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        return;
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (error) {
      console.error('Error al copiar al portapapeles:', error);
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setShowCopiedMessage(true);
        setTimeout(() => setShowCopiedMessage(false), 2000);
      } catch (err) {
        console.error('Error al copiar:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="flex items-center gap-6">
      <button
        onClick={handleLikeClick}
        className={`flex items-center gap-2 transition-colors ${
          isLiked 
            ? "text-orange-500 dark:text-orange-400" 
            : "text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400"
        } ${isCreatingLike || isDeletingLike || likesLoading ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
        aria-label="Dar like al artículo"
      >
        <HugeiconsIcon
          icon={FavouriteIcon}
          size={20}
          className={isLiked ? "text-orange-500 dark:text-orange-400" : ""}
          strokeWidth={2}
        />
        <span>{likesCount}</span>
      </button>
      <button
        onClick={handleCommentsClick}
        className="flex items-center gap-2 text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400 transition-colors cursor-pointer"
        aria-label="Ver comentarios"
      >
        <HugeiconsIcon
          icon={BubbleChatIcon}
          size={20}
          className="text-current"
          strokeWidth={2}
        />
        <span>{commentsCount}</span>
      </button>
      <div className="flex items-center gap-2 text-[#616161] dark:text-[#b0b0b0]">
        <HugeiconsIcon
          icon={ViewIcon}
          size={20}
          className="text-[#616161] dark:text-[#b0b0b0]"
          strokeWidth={2}
        />
        <span>{viewsCount}</span>
      </div>
      <button
        onClick={handleShare}
        className="flex items-center gap-2 text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400 transition-colors cursor-pointer relative"
        aria-label="Compartir artículo"
        title={showCopiedMessage ? '¡Enlace copiado!' : 'Compartir artículo'}
      >
        <HugeiconsIcon
          icon={ShareIcon}
          size={20}
          className="text-current"
          strokeWidth={2}
        />
        {showCopiedMessage && (
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#212121] dark:bg-[#ffffff] text-[#ffffff] dark:text-[#212121] text-xs px-2 py-1 rounded whitespace-nowrap">
            ¡Enlace copiado!
          </span>
        )}
      </button>
      {user?.id && (
        <button
          onClick={handleFavorite}
          className={`flex items-center gap-2 transition-colors ${
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
      <ConfirmModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onConfirm={handleGoToAuth}
        title="¡Únete a nuestra comunidad! 🐾"
        message="Para dar like y ser parte de nuestra comunidad, necesitas una cuenta. ¡Es gratis y solo toma un minuto!"
        confirmText="Ya tengo cuenta/Registrarme"
        cancelText="Tal vez después"
        confirmButtonColor="orange"
      />
    </div>
  );
}

