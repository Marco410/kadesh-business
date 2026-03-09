"use client";

import Image from 'next/image';
import { formatDateWithDay } from 'kadesh/utils/format-date';
import Avatar from './Avatar';
import { div } from 'framer-motion/client';

interface User {
  createdAt: string;
  name: string;
  lastName?: string | null;
  secondLastName?: string | null;
  username: string;
  verified?: boolean | null;
  profileImage?: {
    url: string;
  } | null;
}

interface UserInfoProps {
  user: User;
  label?: string;
}

export default function UserInfo({ user, label = "Reportado por" }: UserInfoProps) {
  return (
    <div className="flex items-start justify-between pt-4 border-t border-[#e0e0e0] dark:border-[#3a3a3a]">
      <div className="flex-1 flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-[#616161] dark:text-[#b0b0b0] uppercase tracking-wide mb-1">
          {label}
        </h3>
        <div className="flex items-center gap-2">
          <Avatar
            author={{
              id: user.username || '',
              name: user.name,
              lastName: user.lastName || '',
              username: user.username,
              verified: user.verified || false,
              profileImage: user.profileImage,
              createdAt: user.createdAt,
            }}
            verify={user.verified || false}
          />
          <div className="flex flex-col">
            <p className="text-[#212121] dark:text-[#ffffff] font-medium">
              {user.name} {user.lastName || ''} {user.secondLastName || ''}
            </p>
            {user.username && (
              <div className="flex flex-row items-center gap-2">
              <p className="text-[#616161] dark:text-[#b0b0b0] text-xs mt-1">
                @{user.username} 
              </p>
              {user.verified && <Image src="/icons/firmar.png" alt="Verificado" width={12} height={12} className="object-contain" />}
              </div>
            )}
            <small className="text-[#616161] dark:text-[#b0b0b0] text-xs">
              Se unió el: {formatDateWithDay(user.createdAt)}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
