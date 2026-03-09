"use client";

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import { 
  CREATE_BLOG_SUBSCRIPTION_MUTATION,
  CreateBlogSubscriptionVariables,
  CreateBlogSubscriptionResponse
} from 'kadesh/utils/queries';
import { useUser } from 'kadesh/utils/UserContext';

interface NewsletterSubscriptionProps {
  className?: string;
  title?: string;
  description?: string;
  showTitle?: boolean;
}

export default function NewsletterSubscription({ 
  className = '',
  title = 'Suscríbete a nuestro blog',
  description = 'Recibe las últimas historias, consejos y noticias sobre bienestar animal directamente en tu correo.',
  showTitle = true,
}: NewsletterSubscriptionProps) {
  const { user } = useUser();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [createBlogSubscription, { loading }] = useMutation<
    CreateBlogSubscriptionResponse,
    CreateBlogSubscriptionVariables
  >(CREATE_BLOG_SUBSCRIPTION_MUTATION, {
    onCompleted: () => {
      setSuccess(true);
      setEmail('');
      setError('');
      setTimeout(() => setSuccess(false), 5000);
    },
    onError: (error) => {
      console.error('Error al suscribirse:', error);
      setError('Hubo un error al procesar tu suscripción. Por favor, intenta de nuevo.');
    },
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError('Por favor, ingresa tu correo electrónico');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor, ingresa un correo electrónico válido');
      return;
    }

    try {
      await createBlogSubscription({
        variables: {
          data: {
            email: email.trim(),
            active: true,
            ...(user?.id && {
              user: {
                connect: {
                  id: user.id,
                },
              },
            }),
          },
        },
      });
    } catch (error) {
      console.error('Error al suscribirse:', error);
    }
  };

  return (
    <section 
      aria-labelledby="newsletter-heading"
      className={`bg-[#f5f5f5] dark:bg-[#1e1e1e] py-16 px-4 sm:px-6 lg:px-8 ${className}`}
    >
      <div className="max-w-2xl mx-auto text-center">
        {showTitle && (
          <motion.h2
            id="newsletter-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-[#212121] dark:text-[#ffffff] mb-4"
          >
            {title}
          </motion.h2>
        )}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[#616161] dark:text-[#b0b0b0] mb-6"
        >
          {description}
        </motion.p>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm font-medium max-w-md mx-auto"
          >
            ¡Suscripción exitosa! Te notificaremos cuando publiquemos nuevo contenido.
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium max-w-md mx-auto"
          >
            {error}
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          onSubmit={handleSubmit}
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Correo electrónico para suscripción
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            placeholder="Tu correo electrónico"
            required
            className={`flex-1 px-4 py-3 rounded-lg bg-[#ffffff] dark:bg-[#121212] border ${
              error ? 'border-red-500 dark:border-red-500' : 'border-[#e0e0e0] dark:border-[#3a3a3a]'
            } text-[#212121] dark:text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors`}
            aria-label="Correo electrónico para suscripción al blog"
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={loading || !email.trim()}
            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 dark:hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-label="Suscribirse al blog de KADESH"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Suscribiendo...</span>
              </>
            ) : (
              'Suscribirse'
            )}
          </button>
        </motion.form>
      </div>
    </section>
  );
}
