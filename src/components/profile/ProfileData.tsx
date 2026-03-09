"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InformationCircleIcon,
  Edit01Icon,
} from "@hugeicons/core-free-icons";
import {
  UPDATE_USER_MUTATION,
  USER_QUERY,
  type UpdateUserResponse,
  type UpdateUserVariables,
  type UserQueryResponse,
  type UserQueryVariables,
} from "kadesh/utils/queries";
import { useUser } from "kadesh/utils/UserContext";
import { Routes } from "kadesh/core/routes";
import type { AuthenticatedItem } from "kadesh/utils/types";

const INPUT_CLASS =
  "w-full px-4 py-3 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed";

const DISABLED_FIELD_CLASS =
  "w-full px-4 py-3 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#f5f5f5] dark:bg-[#2a2a2a] text-[#616161] dark:text-[#b0b0b0]";

const CONTACT_MESSAGE =
  'Si necesitas actualizar este campo, envía un mensaje en contacto.';

function toDateInputValue(isoOrNull: string | null | undefined): string {
  if (!isoOrNull) return "";
  const d = new Date(isoOrNull);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

interface SaveChangesButtonProps {
  isDirty: boolean;
  saving: boolean;
  onSave: () => void;
}

function SaveChangesButton({
  isDirty,
  saving,
  onSave,
}: SaveChangesButtonProps) {
  if (!isDirty) return null;
  return (
    <button
      type="button"
      onClick={onSave}
      disabled={saving}
      className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
    >
      {saving ? (
        <>
          <span className="animate-spin size-4 border-2 border-white border-t-transparent rounded-full" />
          Guardando...
        </>
      ) : (
        "Guardar cambios"
      )}
    </button>
  );
}

interface ProfileDataProps {
  user: AuthenticatedItem;
}

export default function ProfileData({ user: userProp }: ProfileDataProps) {
  const { refreshUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, loading: userLoading, refetch: refetchUser } = useQuery<
    UserQueryResponse,
    UserQueryVariables
  >(USER_QUERY, {
    variables: { where: { id: userProp.id } },
    skip: !userProp?.id,
  });

  const user = data?.user ?? userProp;

  const [name, setName] = useState(user.name ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [secondLastName, setSecondLastName] = useState(
    user.secondLastName ?? "",
  );
  const [phone, setPhone] = useState(user.phone ?? "");
  const [birthday, setBirthday] = useState(
    toDateInputValue((user as { birthday?: string | null }).birthday),
  );
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    setName(user.name ?? "");
    setLastName(user.lastName ?? "");
    setSecondLastName(user.secondLastName ?? "");
    setPhone(user.phone ?? "");
    setBirthday(
      toDateInputValue((user as { birthday?: string | null }).birthday),
    );
  }, [user]);

  const currentBirthdayIso = (user as { birthday?: string | null }).birthday
    ? toDateInputValue((user as { birthday?: string | null }).birthday)
    : "";
  const isDirty =
    name !== (user.name ?? "") ||
    lastName !== (user.lastName ?? "") ||
    (secondLastName || "") !== (user.secondLastName ?? "") ||
    (phone || "") !== (user.phone ?? "") ||
    (birthday || "") !== currentBirthdayIso;

  const [updateUser, { loading: saving }] = useMutation<
    UpdateUserResponse,
    UpdateUserVariables
  >(UPDATE_USER_MUTATION, {
    onCompleted: async () => {
      setSaveError("");
      await Promise.all([refetchUser(), refreshUser()]);
    },
    onError: () => {
      setSaveError("No se pudo guardar. Intenta de nuevo.");
    },
  });

  const [saveError, setSaveError] = useState("");

  const handleSave = async () => {
    if (!isDirty || !user.id) return;
    setSaveError("");
    await updateUser({
      variables: {
        where: { id: user.id },
        data: {
          name: name || undefined,
          lastName: lastName || undefined,
          secondLastName: secondLastName.trim() || null,
          phone: phone.trim() || null,
          birthday: birthday || null,
        },
      },
    });
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || !user.id) {
      if (file && !file.type.startsWith("image/")) {
        setImageError("Selecciona un archivo de imagen (JPG, PNG, etc.).");
      }
      e.target.value = "";
      return;
    }
    setImageError("");
    setImageUploading(true);
    try {
      await updateUser({
        variables: {
          where: { id: user.id },
          data: { profileImage: { upload: file } },
        },
      });
      await refreshUser();
    } catch {
      setImageError("No se pudo actualizar la imagen. Intenta de nuevo.");
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "No especificado";
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (userLoading && !data?.user) {
    return (
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 sm:p-8 border border-[#e0e0e0] dark:border-[#3a3a3a] shadow-md dark:shadow-lg">
        <div className="flex items-center justify-center py-12">
          <span className="animate-spin size-8 border-2 border-orange-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 sm:p-8 border border-[#e0e0e0] dark:border-[#3a3a3a] shadow-md dark:shadow-lg">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-[#212121] dark:text-[#ffffff]">
          Información Personal
        </h2>
        <SaveChangesButton
          isDirty={isDirty}
          saving={saving}
          onSave={handleSave}
        />
      </div>

      {saveError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium">
          {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Avatar con botón editar */}
        <div className="md:col-span-2 flex items-center gap-6 mb-4 pb-6 border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
          <div className="flex flex-col items-start gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label="Subir nueva foto de perfil"
              onChange={handleImageChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageUploading}
              className="relative w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-2xl overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {user.profileImage?.url ? (
                <Image
                  src={user.profileImage.url}
                  alt={user.name || "Usuario"}
                  fill
                  className="object-cover"
                />
              ) : (
                <span>{user.name?.charAt(0) || "U"}</span>
              )}
              {/* Gradient + lápiz siempre visible */}
              <span className="absolute inset-0 rounded-full bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 transition-opacity" />
              <span className="absolute inset-0 flex items-center justify-center opacity-100 transition-opacity">
                <span className="rounded-full bg-white/90 dark:bg-black/50 p-1.5">
                  <HugeiconsIcon
                    icon={Edit01Icon}
                    className="size-5 text-[#212121] dark:text-white"
                  />
                </span>
              </span>
              {imageUploading && (
                <span className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <span className="animate-spin size-6 border-2 border-white border-t-transparent rounded-full" />
                </span>
              )}
            </button>
            {imageError && (
              <p className="text-sm text-red-600 dark:text-red-400 max-w-[24rem]">
                {imageError}
              </p>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#212121] dark:text-[#ffffff]">
              {user.name} {user.lastName} {user.secondLastName || ""}
            </h3>
            <p className="text-[#616161] dark:text-[#b0b0b0]">
              @{user.username}
            </p>
            {user.verified && (
              <span className="inline-flex items-center gap-1 mt-1 text-xs text-orange-500 dark:text-orange-400">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 .723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Verificado
              </span>
            )}
          </div>
        </div>

        {/* Nombre - editable */}
        <div>
          <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2">
            Nombre
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className={INPUT_CLASS}
          />
        </div>

        {/* Apellido Paterno - editable */}
        <div>
          <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2">
            Apellido Paterno
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Apellido paterno"
            className={INPUT_CLASS}
          />
        </div>

        {/* Apellido Materno - editable */}
        <div>
          <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2">
            Apellido Materno
          </label>
          <input
            type="text"
            value={secondLastName}
            onChange={(e) => setSecondLastName(e.target.value)}
            placeholder="Apellido materno (opcional)"
            className={INPUT_CLASS}
          />
        </div>

        {/* Username - no editable */}
        <div>
          <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2">
            Nombre de Usuario
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={user.username ? `@${user.username}` : ""}
              readOnly
              disabled
              className={DISABLED_FIELD_CLASS}
            />
          </div>
          <p className="mt-1.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
            Si necesitas actualizar este campo, envía un mensaje en{" "}
            <Link
              href={Routes.contact}
              className="text-orange-500 dark:text-orange-400 hover:underline font-medium"
            >
              contacto
            </Link>
            .
          </p>
        </div>

        {/* Email - no editable */}
        <div>
          <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2">
            Correo Electrónico
          </label>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={user.email ?? ""}
              readOnly
              disabled
              className={DISABLED_FIELD_CLASS}
            />
          </div>
          <p className="mt-1.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
            Si necesitas actualizar este campo, envía un mensaje en{" "}
            <Link
              href={Routes.contact}
              className="text-orange-500 dark:text-orange-400 hover:underline font-medium"
            >
              contacto
            </Link>
            .
          </p>
        </div>

        {/* Teléfono - editable */}
        <div>
          <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+52 55 1234 5678"
            className={INPUT_CLASS}
          />
        </div>

        {/* Fecha de Nacimiento - editable */}
        <div>
          <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2">
            Fecha de Nacimiento
          </label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2">
            Edad
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={
                (user as { age?: number | null }).age
                  ? `${(user as { age?: number | null }).age} años`
                  : "No especificado"
              }
              readOnly
              disabled
              className={DISABLED_FIELD_CLASS}
            />
          </div>
          <p className="mt-1.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
            Se autogenera con tu fecha de nacimiento.
          </p>
        </div>

        {/* Miembro desde - no editable */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2">
            Miembro desde
          </label>
          <div className="px-4 py-3 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#f5f5f5] dark:bg-[#2a2a2a] text-[#616161] dark:text-[#b0b0b0]">
            {formatDate(user.createdAt)}
          </div>
        </div>

        {/* Botón guardar abajo (visible en móvil) */}
        <div className="md:col-span-2 flex justify-center sm:justify-end pt-2">
          <SaveChangesButton
            isDirty={isDirty}
            saving={saving}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
}
