"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import {
  AUTHENTICATE_USER_MUTATION,
  REGISTER_USER_MUTATION,
  type RegisterUserVariables,
  type RegisterUserResponse,
  type AuthenticateUserVariables,
  type AuthenticateUserResponse,
} from 'kadesh/utils/queries';
import { useUser } from 'kadesh/utils/UserContext';
import type { AuthenticatedItem } from 'kadesh/utils/types';
import {
  setRegisterSuccessUrl,
  trackCompleteRegistration,
  withRegisterSuccessUrl,
} from 'kadesh/utils/facebook-pixel';
import { Routes } from 'kadesh/core/routes';
import { sileo } from 'sileo';
import { useTouchUserLastLogin } from './useTouchUserLastLogin';

function persistSessionToken(sessionToken: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('keystonejs-session-token', sessionToken);
  const expires = new Date();
  expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000);
  const isSecure = window.location.protocol === 'https:';
  document.cookie = `keystonejs-session=${sessionToken}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`;
}

/** Texto crudo de error (GraphQL + mensaje) para detectar patrones sin filtrar al usuario. */
function collectRegisterErrorText(err: unknown): string {
  if (!err) return '';
  if (err instanceof Error) {
    const withGql = err as Error & {
      graphQLErrors?: ReadonlyArray<{ message?: string }>;
    };
    const gql = withGql.graphQLErrors?.map((g) => g.message ?? '').join(' ') ?? '';
    return [gql, err.message].filter(Boolean).join(' ');
  }
  return String(err);
}

/**
 * Convierte errores de API/Prisma en mensajes claros en español (sin filtrar detalles internos).
 */
export function mapRegisterErrorToUserMessage(err: unknown): string {
  const lower = collectRegisterErrorText(err).toLowerCase();

  if (lower.includes('unique constraint') && lower.includes('email')) {
    return 'Ya existe una cuenta con este correo. Inicia sesión o usa otro correo electrónico.';
  }
  if (
    lower.includes('unique constraint') &&
    (lower.includes('username') || lower.includes('user'))
  ) {
    return 'Ese usuario ya está registrado. Inicia sesión o usa otros datos.';
  }
  if (lower.includes('unique constraint')) {
    return 'Parte de la información ya está registrada. Revisa el formulario o inicia sesión.';
  }
  if (lower.includes('prisma')) {
    return 'No se pudo completar el registro. Verifica tus datos e intenta de nuevo.';
  }
  return 'No se pudo completar el registro. Intenta de nuevo.';
}

interface UseRegisterOptions {
  onSuccess?: () => void;
  redirectTo?: string | null;
  referralCode?: string | null;
}

export function useRegister(options?: UseRegisterOptions) {
  const router = useRouter();
  const touchUserLastLoginAt = useTouchUserLastLogin();
  const { refreshUser, setUser } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [referralCode, setReferralCode] = useState(options?.referralCode ?? '');

  const [authenticateUser] = useMutation<
    AuthenticateUserResponse,
    AuthenticateUserVariables
  >(AUTHENTICATE_USER_MUTATION);

  const [registerUser, { loading }] = useMutation<
    RegisterUserResponse,
    RegisterUserVariables
  >(REGISTER_USER_MUTATION);

  const clearForm = () => {
    setName('');
    setLastName('');
    setCompanyName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setReferralCode('');
  };

  const loginAfterRegister = async (loginEmail: string, loginPassword: string) => {
    const { data } = await authenticateUser({
      variables: {
        email: loginEmail,
        password: loginPassword,
      },
    });

    const auth = data?.authenticateUserWithPassword;
    if (auth?.__typename !== 'UserAuthenticationWithPasswordSuccess') {
      return false;
    }

    if (auth.sessionToken) {
      persistSessionToken(auth.sessionToken);
    }

    const loggedInUser = auth.item;
    if (loggedInUser?.id) {
      await touchUserLastLoginAt(loggedInUser.id);
      const userFromLogin: AuthenticatedItem = {
        ...loggedInUser,
        roles: loggedInUser.roles ?? null,
        birthday: (loggedInUser as { birthday?: string | null }).birthday ?? null,
        age: (loggedInUser as { age?: string | null }).age ?? null,
        createdAt:
          (loggedInUser as { createdAt?: string }).createdAt ??
          new Date().toISOString(),
      };
      setUser(userFromLogin);
    }

    await refreshUser();
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');

    if (!name || !lastName || !companyName?.trim() || !email || !password || !confirmPassword) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser({
        variables: {
          data: {
            name,
            lastName,
            email,
            password,
            phone: phone || undefined,
            product: 'saas',
          },
          referrerCode: referralCode || null,
          companyName: companyName.trim(),
        },
      });

      setRegisterSuccessUrl(router);
      trackCompleteRegistration();

      try {
        const didLogin = await loginAfterRegister(email, password);
        if (didLogin) {
          clearForm();
          // Meta captura ?registro-exitoso=1 en la URL actual antes de ir al panel
          await new Promise((resolve) => setTimeout(resolve, 400));
          router.push(withRegisterSuccessUrl(options?.redirectTo || Routes.panel));
          return;
        }
      } catch (autoLoginErr) {
        console.error('Error al iniciar sesión tras el registro:', autoLoginErr);
      }

      clearForm();
      options?.onSuccess?.();
    } catch (regErr) {
      // No UserAuthLog: el backend ya registra intentos/resultado de registerUser
      const friendly = mapRegisterErrorToUserMessage(regErr);
      setError(friendly);
      sileo.error({ title: 'Error al registrar usuario', description: friendly });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    name,
    setName,
    lastName,
    setLastName,
    companyName,
    setCompanyName,
    email,
    setEmail,
    phone,
    setPhone,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    referralCode,
    setReferralCode,
    error,
    setError,
    loading: loading || isSubmitting,
    handleSubmit,
  };
}

