"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FileAttachmentIcon,
  Add01Icon,
  Delete02Icon,
  ArrowRight01Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";
import { formatDate } from "kadesh/utils/format-date";
import { USER_COMPANY_CATEGORIES_QUERY } from "kadesh/components/profile/sales/queries";
import type {
  UserCompanyCategoriesResponse,
  UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import {
  TECH_FILES_QUERY,
  CREATE_TECH_FILE_MUTATION,
  DELETE_TECH_FILE_MUTATION,
  TECH_FILE_CATEGORIES,
  type TechFilesQueryVariables,
  type TechFilesQueryResponse,
  type TechFileItem,
  type CreateTechFileVariables,
  type CreateTechFileResponse,
  type DeleteTechFileVariables,
  type DeleteTechFileResponse,
} from "kadesh/components/profile/sales/archivos/queries";
import { useUser } from "kadesh/utils/UserContext";
import { Role } from "kadesh/constants/constans";
import { sileo } from "sileo";

interface ArchivosSectionProps {
  userId: string;
}

export default function ArchivosSection({ userId }: ArchivosSectionProps) {
  const { user } = useUser();
  const isAdminCompany = user?.roles?.some((r) => r.name === Role.ADMIN_COMPANY) ?? false;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(TECH_FILE_CATEGORIES[0].value);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: userData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: userId } },
    skip: !userId,
  });

  const companyId = userData?.user?.company?.id ?? null;

  const { data: filesData, loading: loadingFiles, refetch: refetchFiles } = useQuery<
    TechFilesQueryResponse,
    TechFilesQueryVariables
  >(TECH_FILES_QUERY, {
    variables: {
      where: { company: { id: { equals: companyId ?? "" } } },
    },
    skip: !companyId,
  });

  const [createTechFile] = useMutation<CreateTechFileResponse, CreateTechFileVariables>(
    CREATE_TECH_FILE_MUTATION,
    {
      refetchQueries: [
        {
          query: TECH_FILES_QUERY,
          variables: {
            where: { company: { id: { equals: companyId ?? "" } } },
          },
        },
      ],
    }
  );

  const [deleteTechFile] = useMutation<DeleteTechFileResponse, DeleteTechFileVariables>(
    DELETE_TECH_FILE_MUTATION,
    {
      refetchQueries: [
        {
          query: TECH_FILES_QUERY,
          variables: {
            where: { company: { id: { equals: companyId ?? "" } } },
          },
        },
      ],
    }
  );

  const files: TechFileItem[] = filesData?.techFiles ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      sileo.warning({ title: "Necesitas tener una empresa asociada para subir archivos." });
      return;
    }
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      sileo.warning({ title: "El nombre del archivo es obligatorio." });
      return;
    }
    if (!selectedFile) {
      sileo.warning({ title: "Selecciona un archivo para subir." });
      return;
    }
    setUploading(true);
    try {
      await createTechFile({
        variables: {
          data: {
            title: trimmedTitle,
            description: description.trim() || null,
            category: category || TECH_FILE_CATEGORIES[0].value,
            file: { upload: selectedFile },
            company: { connect: { id: companyId } },
          },
        },
      });
      sileo.success({ title: "Archivo subido correctamente" });
      setTitle("");
      setDescription("");
      setCategory(TECH_FILE_CATEGORIES[0].value);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      refetchFiles();
    } catch (err) {
      sileo.error({
        title: "No se pudo subir el archivo",
        description: err instanceof Error ? err.message : "Intenta de nuevo más tarde.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    setDeletingId(id);
    try {
      await deleteTechFile({ variables: { where: { id } } });
      sileo.success({ title: "Archivo eliminado" });
      refetchFiles();
    } catch (err) {
      sileo.error({
        title: "No se pudo eliminar el archivo",
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (!companyId) {
    return (
      <div className="rounded-2xl border border-[#e5e5e5] dark:border-[#333] bg-white dark:bg-[#1a1a1a] p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
            <HugeiconsIcon icon={FileAttachmentIcon} size={24} className="text-amber-500 dark:text-amber-400" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-[#1a1a1a] dark:text-white mb-1">Sin empresa asociada</h3>
            <p className="text-[#616161] dark:text-[#a0a0a0] text-sm leading-relaxed">
              Asocia una empresa a tu cuenta para poder subir y gestionar archivos (PDF, DOC, etc.).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {isAdminCompany && (
        <div className="rounded-2xl border border-[#e5e5e5] dark:border-[#333] bg-white dark:bg-[#1a1a1a] shadow-sm overflow-hidden">
          <div className="border-l-4 border-orange-500 bg-[#fafafa] dark:bg-[#222] px-6 py-4">
            <h2 className="text-lg font-semibold text-[#1a1a1a] dark:text-white">Subir archivo</h2>
            <p className="text-sm text-[#616161] dark:text-[#a0a0a0] mt-0.5">
              PDF, DOC, DOCX, XLS, XLSX o imágenes. Completa los datos y selecciona el archivo.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="sm:col-span-2 sm:col-start-1">
                <label htmlFor="archivo-title" className="block text-sm font-medium text-[#374151] dark:text-[#e5e5e5] mb-2">
                  Nombre del archivo <span className="text-red-500">*</span>
                </label>
                <input
                  id="archivo-title"
                  type="text"
                  placeholder={`Ej. Proceso de cierre ${new Date().getFullYear()}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={uploading}
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] dark:border-[#404040] bg-white dark:bg-[#0f0f0f] text-[#1a1a1a] dark:text-white placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all disabled:opacity-60"
                />
              </div>
              <div>
                <label htmlFor="archivo-category" className="block text-sm font-medium text-[#374151] dark:text-[#e5e5e5] mb-2">
                  Categoría
                </label>
                <select
                  id="archivo-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={uploading}
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] dark:border-[#404040] bg-white dark:bg-[#0f0f0f] text-[#1a1a1a] dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all disabled:opacity-60"
                >
                  {TECH_FILE_CATEGORIES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="archivo-description" className="block text-sm font-medium text-[#374151] dark:text-[#e5e5e5] mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  id="archivo-description"
                  rows={2}
                  placeholder="Breve descripción del contenido"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={uploading}
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] dark:border-[#404040] bg-white dark:bg-[#0f0f0f] text-[#1a1a1a] dark:text-white placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all disabled:opacity-60 resize-none"
                />
              </div>
            </div>

            <div className="mb-6">
              <span className="block text-sm font-medium text-[#374151] dark:text-[#e5e5e5] mb-2">
                Archivo <span className="text-red-500">*</span>
              </span>
              <label
                className={`flex flex-col items-center justify-center w-full min-h-[140px] rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                  selectedFile
                    ? "border-orange-500 bg-orange-500/5 dark:bg-orange-500/10"
                    : "border-[#d1d5db] dark:border-[#404040] hover:border-orange-400 dark:hover:border-orange-500/60 hover:bg-[#fafafa] dark:hover:bg-[#252525]"
                } ${uploading ? "opacity-60 pointer-events-none" : ""}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
                {selectedFile ? (
                  <>
                    <HugeiconsIcon icon={FileAttachmentIcon} size={32} className="text-orange-500 dark:text-orange-400 mb-2" />
                    <span className="text-sm font-medium text-[#1a1a1a] dark:text-white truncate max-w-[280px] px-2 text-center">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-[#616161] dark:text-[#a0a0a0] mt-1">Haz clic para cambiar</span>
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={Upload01Icon} size={36} className="text-[#9ca3af] dark:text-[#6b7280] mb-2" />
                    <span className="text-sm font-medium text-[#374151] dark:text-[#d1d5db]">Elige un archivo</span>
                    <span className="text-xs text-[#6b7280] dark:text-[#6b7280] mt-1">PDF, DOC, XLS o imágenes</span>
                  </>
                )}
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
            >
              {uploading ? (
                <>
                  <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Subiendo...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={Add01Icon} size={20} />
                  Subir archivo
                </>
              )}
            </button>
          </form>
        </div>
      )}

      <div className="rounded-2xl border border-[#e5e5e5] dark:border-[#333] bg-white dark:bg-[#1a1a1a] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e5e5e5] dark:border-[#333] flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-[#1a1a1a] dark:text-white">Tus archivos</h2>
          {!loadingFiles && files.length > 0 && (
            <span className="text-sm text-[#616161] dark:text-[#a0a0a0] bg-[#f3f4f6] dark:bg-[#2a2a2a] px-3 py-1 rounded-full font-medium">
              {files.length} {files.length === 1 ? "archivo" : "archivos"}
            </span>
          )}
        </div>
        <div className="p-6 sm:p-8">
          {loadingFiles ? (
            <div className="flex items-center justify-center gap-3 py-12 text-[#616161] dark:text-[#a0a0a0]">
              <span className="size-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
              <span>Cargando archivos...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[#f3f4f6] dark:bg-[#2a2a2a] flex items-center justify-center mb-4">
                <HugeiconsIcon icon={FileAttachmentIcon} size={28} className="text-[#9ca3af] dark:text-[#6b7280]" />
              </span>
              <p className="text-[#374151] dark:text-[#d1d5db] font-medium">Aún no hay archivos</p>
              <p className="text-sm text-[#6b7280] dark:text-[#6b7280] mt-1 max-w-xs">
                {isAdminCompany ? "Sube el primero usando el formulario de arriba." : "Los archivos que suba tu empresa aparecerán aquí."}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {files.map((file) => (
                <li
                  key={file.id}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-[#e5e5e5] dark:border-[#333] bg-[#fafafa] dark:bg-[#222] p-4 hover:border-[#d1d5db] dark:hover:border-[#404040] transition-colors"
                >
                  <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center">
                    <HugeiconsIcon icon={FileAttachmentIcon} size={22} className="text-orange-500 dark:text-orange-400" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#1a1a1a] dark:text-white truncate">{file.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#e5e7eb] dark:bg-[#333] text-[#4b5563] dark:text-[#a0a0a0] capitalize">
                        {TECH_FILE_CATEGORIES.find((opt) => opt.value === file.category)?.label ?? file.category}
                      </span>
                      {file.description && (
                        <span className="text-xs text-[#6b7280] dark:text-[#6b7280] truncate max-w-[200px] sm:max-w-none">
                          {file.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {file.file?.url && (
                      <a
                        href={file.file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-[#333] border border-[#e5e5e5] dark:border-[#404040] text-sm font-medium text-[#1a1a1a] dark:text-white hover:bg-[#f9fafb] dark:hover:bg-[#404040] transition-colors"
                      >
                        Ver
                        <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                      </a>
                    )}
                    {isAdminCompany && (
                      <button
                        type="button"
                        onClick={() => handleDelete(file.id)}
                        disabled={deletingId === file.id}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                        aria-label="Eliminar archivo"
                      >
                        {deletingId === file.id ? (
                          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <HugeiconsIcon icon={Delete02Icon} size={16} />
                        )}
                        Eliminar
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
