"use client";

import { useState } from 'react';
import Image from 'next/image';
import { usePostComments } from '../hooks/usePostComments';
import { ConfirmModal } from '../../shared';
import Avatar from './AuthorAvatar';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import { useUser } from 'kadesh/utils/UserContext';
import { Routes } from 'kadesh/core/routes';

interface CommentsSectionProps {
  postId: string;
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const {
    comments,
    commentsCount,
    comment,
    setComment,
    isSubmitting,
    isCreatingComment,
    isDeletingComment,
    handleSubmit,
    handleDelete,
  } = usePostComments(postId);

  const { user } = useUser();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const openDeleteModal = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setCommentToDelete(null);
  };

  const confirmDelete = () => {
    if (commentToDelete) {
      handleDelete(commentToDelete);
      closeDeleteModal();
    }
  };

  return (
    <section id="comments-section" className="mt-12 pt-8 scroll-mt-20">
      <h2 className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mb-6">
        Comentarios ({commentsCount}) 
      </h2>
      
      <div className="space-y-6">
        { user ? (
        <form onSubmit={handleSubmit}>
          <div className="bg-[#f5f5f5] dark:bg-[#1e1e1e] rounded-xl p-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe tu comentario..."
              className="w-full min-h-[120px] p-4 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 resize-none"
              rows={4}
              disabled={isSubmitting || isCreatingComment}
            />
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={!comment.trim() || isSubmitting || isCreatingComment}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || isCreatingComment ? 'Publicando...' : 'Publicar comentario'}
              </button>
            </div>
          </div>
        </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-center text-[#616161] dark:text-[#b0b0b0] mb-4">
              ¿Quieres unirte a la conversación?{' '}
              <span className="font-semibold text-orange-500 dark:text-orange-400">
                Inicia sesión para dejar tu comentario.
              </span>
            </p>
            <a
              href={Routes.auth.login}
              className="inline-block px-5 py-2 bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
            >
              Iniciar sesión
            </a>
          </div>
        )}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-[#616161] dark:text-[#b0b0b0] py-8">
              No hay comentarios aún. ¡Sé el primero en comentar!
            </p>
          ) : (
            comments.map((commentItem) => (
              <div
                key={commentItem.id}
                className="bg-[#f5f5f5] dark:bg-[#1e1e1e] rounded-xl p-6 border border-[#e0e0e0] dark:border-[#3a3a3a]"
              >
                <div className="flex items-start gap-4">
                  <Avatar
                    author={commentItem.user ? {
                      id: commentItem.user.id,
                      name: commentItem.user.name,
                      lastName: commentItem.user.lastName,
                      username: commentItem.user.username,
                      verified: commentItem.user.verified,
                      profileImage: commentItem.user.profileImage,
                      createdAt: '',
                    } : null}
                    size={48}
                    verify={commentItem.user?.verified || false}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-[#212121] dark:text-[#ffffff]">
                        {commentItem.user
                          ? `${commentItem.user.name} ${commentItem.user.lastName}`
                          : 'Usuario anónimo'}
                      </p>
                      {commentItem.user?.verified && (
                        <Image
                          src="/icons/firmar.png"
                          alt="Verificado"
                          width={16}
                          height={16}
                          className="object-contain"
                        />
                      )}
                      {commentItem.user && (
                        <span className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                          @{commentItem.user.username}
                        </span>
                      )}
                    </div>
                    <p className="text-[#212121] dark:text-[#ffffff] whitespace-pre-wrap">
                      {commentItem.comment}
                    </p>
                    <div className="flex items-center gap-2 justify-between">
                      <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-3"> {new Date(commentItem.createdAt).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })} </p>
                      {
                        commentItem.user?.id === user?.id && (
                          <button
                            onClick={() => openDeleteModal(commentItem.id)}
                            disabled={isDeletingComment}
                            className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-3 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Eliminar comentario"
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={20} />
                          </button>
                        )
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Eliminar comentario"
        message="¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        isLoading={isDeletingComment}
        confirmButtonColor="red"
      />
    </section>
  );
}

