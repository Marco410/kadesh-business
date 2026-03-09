"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import {
  CREATE_USER_MUTATION,
  AUTHENTICATE_USER_MUTATION,
  CreateUserVariables,
  CreateUserResponse,
  AuthenticateUserVariables,
  AuthenticateUserResponse
} from 'kadesh/utils/queries';
import { useUser } from 'kadesh/utils/UserContext';

interface UseRegisterOptions {
  onSuccess?: () => void;
  redirectTo?: string | null;
}

export function useRegister(options?: UseRegisterOptions) {
  const router = useRouter();
  const { refreshUser } = useUser();
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const [authenticateUser] = useMutation<
    AuthenticateUserResponse,
    AuthenticateUserVariables
  >(AUTHENTICATE_USER_MUTATION);

  const [createUser, { loading }] = useMutation<
    CreateUserResponse,
    CreateUserVariables
  >(CREATE_USER_MUTATION, {
    onCompleted: async () => {
      // Save credentials before clearing form
      const savedEmail = email;
      const savedPassword = password;
      
      // If redirectTo is provided, automatically login after registration
      if (options?.redirectTo) {
        try {
          // Auto-login with the credentials
          const { data } = await authenticateUser({
            variables: {
              email: savedEmail,
              password: savedPassword,
            },
          });

          if (data?.authenticateUserWithPassword?.__typename === 'UserAuthenticationWithPasswordSuccess') {
            const sessionToken = data.authenticateUserWithPassword.sessionToken;
            if (sessionToken && typeof window !== 'undefined') {
              localStorage.setItem('keystonejs-session-token', sessionToken);
              const expires = new Date();
              expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000);
              const isSecure = window.location.protocol === 'https:';
              document.cookie = `keystonejs-session=${sessionToken}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`;
            }
            
            await refreshUser();
            router.push(options.redirectTo);
            
            // Clear form after successful redirect
            setName('');
            setLastName('');
            setEmail('');
            setPhone('');
            setPassword('');
            setConfirmPassword('');
            setError('');
            return;
          }
        } catch (error) {
          console.error('Error auto-logging in:', error);
          // If auto-login fails, just show success message
        }
      }
      
      // Clear form
      setName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      
      // Call success callback if provided
      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error) => {
      setError(error.message || 'Error al registrar usuario');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !lastName || !email || !password || !confirmPassword) {
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

    await createUser({
      variables: {
        data: {
          name,
          lastName,
          email,
          password,
          phone: phone || undefined,
        },
      },
    });
  };

  return {
    name,
    setName,
    lastName,
    setLastName,
    email,
    setEmail,
    phone,
    setPhone,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    setError,
    loading,
    handleSubmit,
  };
}

