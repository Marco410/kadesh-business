"use client";

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import { 
  CREATE_CONTACT_FORM_MUTATION,
  CreateContactFormVariables,
  CreateContactFormResponse
} from 'kadesh/utils/queries';

interface ContactFormProps {
  className?: string;
  showTitle?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function ContactForm({ 
  className = '', 
  showTitle = false,
  onSuccess,
  onError 
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const [createContactForm, { loading }] = useMutation<
    CreateContactFormResponse,
    CreateContactFormVariables
  >(CREATE_CONTACT_FORM_MUTATION, {
    onCompleted: () => {
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      setErrors({});
      // Ocultar mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccess(false), 5000);
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error('Error al enviar formulario:', error);
      setErrors({
        submit: 'Hubo un error al enviar tu mensaje. Por favor, intenta de nuevo.',
      });
      if (onError) {
        onError(error);
      }
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Por favor, ingresa un correo electrónico válido';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'El asunto es requerido';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'El mensaje debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      await createContactForm({
        variables: {
          data: [
            {
              name: formData.name.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim() || undefined,
              subject: formData.subject.trim(),
              message: formData.message.trim(),
              status: 'new',
            },
          ],
        },
      });
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <motion.div
      {...fadeInUp}
      viewport={{ once: true }}
      className={`bg-[#f5f5f5] dark:bg-[#1e1e1e] rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 border border-[#e0e0e0] dark:border-[#3a3a3a] ${className}`}
    >
      {showTitle && (
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-6">
          Envíanos un mensaje
        </h2>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm font-medium">
          ¡Mensaje enviado exitosamente! Te responderemos pronto.
        </div>
      )}

      {errors.submit && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label
              htmlFor="contact-name"
              className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]"
            >
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.name
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-[#e0e0e0] dark:border-[#3a3a3a]'
              } bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all`}
              placeholder="Antonio Pérez"
            />
            {errors.name && (
              <p className="text-sm text-red-500 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="contact-email"
              className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]"
            >
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.email
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-[#e0e0e0] dark:border-[#3a3a3a]'
              } bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all`}
              placeholder="ejemplo@kadesh.com.mx"
            />
            {errors.email && (
              <p className="text-sm text-red-500 dark:text-red-400">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <label
            htmlFor="contact-phone"
            className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]"
          >
            Teléfono <span className="text-gray-500 text-sm">(opcional)</span>
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all"
            placeholder="+52 55 1234 5678"
          />
        </div>

        {/* Subject Field */}
        <div className="space-y-2">
          <label
            htmlFor="contact-subject"
            className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]"
          >
            Asunto <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            value={formData.subject}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.subject
                ? 'border-red-500 dark:border-red-500'
                : 'border-[#e0e0e0] dark:border-[#3a3a3a]'
            } bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all`}
            placeholder="¿En qué podemos ayudarte?"
          />
          {errors.subject && (
            <p className="text-sm text-red-500 dark:text-red-400">
              {errors.subject}
            </p>
          )}
        </div>

        {/* Message Field */}
        <div className="space-y-2">
          <label
            htmlFor="contact-message"
            className="block text-sm font-medium text-[#212121] dark:text-[#ffffff]"
          >
            Mensaje <span className="text-red-500">*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.message
                ? 'border-red-500 dark:border-red-500'
                : 'border-[#e0e0e0] dark:border-[#3a3a3a]'
            } bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all resize-none`}
            placeholder="Escribe tu mensaje aquí..."
          />
          {errors.message && (
            <p className="text-sm text-red-500 dark:text-red-400">
              {errors.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-semibold text-base h-12 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-orange-500 dark:disabled:hover:bg-orange-500"
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
                <span>Enviando...</span>
              </>
            ) : (
              'Enviar Mensaje'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
