"use client";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  MailRemove02Icon,
  CheckmarkCircle02Icon,
  Alert02Icon,
} from '@hugeicons/core-free-icons';
import {
  UNSUBSCRIBE_BLOG_MUTATION,
  UnsubscribeBlogVariables,
  UnsubscribeBlogResponse,
} from 'kadesh/utils/queries';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Blog al que pertenece este front. El backend es compartido con Kadesh Pet. */
const PRODUCT = 'saas';

export default function UnsubscribeBlogClient() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [error, setError] = useState('');

  const [unsubscribeBlog, { data, loading }] = useMutation<
    UnsubscribeBlogResponse,
    UnsubscribeBlogVariables
  >(UNSUBSCRIBE_BLOG_MUTATION, {
    onError: () => {
      setError('No pudimos procesar tu solicitud. Intenta de nuevo más tarde.');
    },
  });

  const result = data?.unsubscribeBlog;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Por favor, ingresa tu correo electrónico');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Por favor, ingresa un correo electrónico válido');
      return;
    }

    await unsubscribeBlog({
      variables: { email: email.trim(), product: PRODUCT },
    });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-[#e0e0e0] bg-[#f5f5f5] p-8 text-center dark:border-[#3a3a3a] dark:bg-[#1e1e1e]">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#ffffff] dark:bg-[#121212]">
          <HugeiconsIcon
            icon={
              result?.success
                ? CheckmarkCircle02Icon
                : result && !result.success
                  ? Alert02Icon
                  : MailRemove02Icon
            }
            size={32}
            className={
              result?.success
                ? 'text-green-500'
                : result && !result.success
                  ? 'text-red-500'
                  : 'text-[#616161] dark:text-[#b0b0b0]'
            }
          />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-[#212121] dark:text-[#ffffff]">
          Cancelar suscripción al blog
        </h1>

        {result?.success ? (
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            {result.message}
          </p>
        ) : (
          <>
            {result ? (
              <p className="mb-4 text-sm font-medium text-red-600 dark:text-red-400">
                {result.message}
              </p>
            ) : (
              <p className="mb-6 text-[#616161] dark:text-[#b0b0b0]">
                Confirma tu correo para dejar de recibir notificaciones de nuevos artículos
                del blog de Kadesh Negocios.
              </p>
            )}

            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <label htmlFor="unsubscribe-email" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="unsubscribe-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Tu correo electrónico"
                required
                className={`w-full rounded-lg border px-4 py-3 bg-[#ffffff] dark:bg-[#121212] ${
                  error
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-[#e0e0e0] dark:border-[#3a3a3a]'
                } text-[#212121] dark:text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors`}
                aria-label="Correo electrónico a dar de baja"
                disabled={loading}
              />

              {error && (
                <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Cancelando...' : 'Cancelar suscripción'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
