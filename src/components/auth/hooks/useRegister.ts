"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import {
  CREATE_USER_MUTATION,
  CREATE_SAAS_COMPANY_MUTATION,
  AUTHENTICATE_USER_MUTATION,
  CreateUserVariables,
  CreateUserResponse,
  CreateSaasCompanyVariables,
  CreateSaasCompanyResponse,
  AuthenticateUserVariables,
  AuthenticateUserResponse
} from 'kadesh/utils/queries';
import {
  ROLES_BY_NAMES_QUERY,
  type RolesByNamesResponse,
  type RolesByNamesVariables,
} from 'kadesh/components/profile/sales/queries';
import { Role } from 'kadesh/constants/constans';
import { useUser } from 'kadesh/utils/UserContext';
import { trackCompleteRegistration } from 'kadesh/utils/facebook-pixel';

interface UseRegisterOptions {
  onSuccess?: () => void;
  redirectTo?: string | null;
}

export function useRegister(options?: UseRegisterOptions) {
  const router = useRouter();
  const { refreshUser } = useUser();
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const [authenticateUser] = useMutation<
    AuthenticateUserResponse,
    AuthenticateUserVariables
  >(AUTHENTICATE_USER_MUTATION);

  const { data: rolesData } = useQuery<
    RolesByNamesResponse,
    RolesByNamesVariables
  >(ROLES_BY_NAMES_QUERY, {
    variables: { where: { name: { in: [Role.VENDEDOR, Role.ADMIN_COMPANY] } } },
  });

  const vendedorRoleId = rolesData?.roles?.find((r) => r.name === Role.VENDEDOR)?.id;
  const adminCompanyRoleId = rolesData?.roles?.find((r) => r.name === Role.ADMIN_COMPANY)?.id;

  const [createSaasCompany] = useMutation<
    CreateSaasCompanyResponse,
    CreateSaasCompanyVariables
  >(CREATE_SAAS_COMPANY_MUTATION);

  const [createUser, { loading }] = useMutation<
    CreateUserResponse,
    CreateUserVariables
  >(CREATE_USER_MUTATION, {
    onCompleted: async () => {
      trackCompleteRegistration();
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
            setCompanyName('');
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
      setCompanyName('');
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

    try {
      const { data: companyData } = await createSaasCompany({
        variables: {
          data: { name: companyName.trim() },
        },
      });

      const companyId = companyData?.createSaasCompany?.id;
      if (!companyId) {
        setError('No se pudo crear la empresa. Intenta de nuevo.');
        return;
      }

      const roleIds = [vendedorRoleId, adminCompanyRoleId].filter(
        (id): id is string => Boolean(id)
      );
      if (roleIds.length === 0) {
        setError('No se pudo asignar los roles. Recarga la página e intenta de nuevo.');
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
            company: { connect: { id: companyId } },
            roles: { connect: roleIds.map((id) => ({ id })) },
          },
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar. Intenta de nuevo.');
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
    error,
    setError,
    loading,
    handleSubmit,
  };
}

