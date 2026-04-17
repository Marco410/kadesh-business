"use client";

import Image from "next/image";

export interface AssigneeAvatarProps {
  name: string;
  lastName?: string | null;
  imageUrl?: string | null;
  size?: number;
  showNativeTitle?: boolean;
}

function initials(name: string, lastName?: string | null) {
  const a = name?.trim()?.[0] ?? "";
  const b = lastName?.trim()?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

export default function AssigneeAvatar({
  name,
  lastName,
  imageUrl,
  size = 28,
  showNativeTitle = true,
}: AssigneeAvatarProps) {
  const label = initials(name, lastName);
  const nativeTitle =
    showNativeTitle ? `${name} ${lastName ?? ""}`.trim() : undefined;
  if (imageUrl) {
    return (
      <span
        title={nativeTitle}
        className="relative shrink-0 overflow-hidden rounded-full ring-2 ring-white dark:ring-[#2a2a2a] shadow-sm"
        style={{ width: size, height: size }}
      >
        <Image
          src={imageUrl}
          alt=""
          width={size}
          height={size}
          className="object-cover w-full h-full"
          unoptimized
        />
      </span>
    );
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-orange-700 dark:text-orange-300 text-[10px] font-semibold ring-2 ring-white dark:ring-[#2a2a2a]"
      style={{ width: size, height: size }}
      title={nativeTitle}
    >
      {label}
    </span>
  );
}
