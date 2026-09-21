import Image from 'next/image';
import { Author } from '../types';

interface AvatarProps {
  author?: Author | null;
  size?: number;
  verify?: boolean;
}

export default function Avatar({ author, size = 48, verify = false }: AvatarProps) {
  return (
    <div className="relative">
      <div 
        className="relative overflow-hidden rounded-full bg-orange-500 font-bold text-white flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {author?.profileImage?.url ? (
          <Image
            src={author.profileImage.url}
            alt={author.name}
            fill
            className="object-cover"
          />
        ) : (
          <span>{author?.name?.charAt(0) || 'A'}</span>
        )}
      </div>
      {verify && (
        <div className="absolute  top-0 right-0 bg-white dark:bg-white rounded-full flex items-center justify-center overflow-hidden">
          <Image
            src="/icons/firmar.png"
            alt="Verificado"
            width={15}
            height={15}
            className="object-contain"
          />
        </div>
      )}
      </div>
  );
}

