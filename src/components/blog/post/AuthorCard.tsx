import { Author } from '../types';
import Avatar from './AuthorAvatar';
import { formatLongDateMx } from 'kadesh/utils/format-date';

interface AuthorCardProps {
  author?: Author | null;
}

export default function AuthorCard({ author }: AuthorCardProps) {
  if (!author) {
    return null;
  }

  return (
    <>
      <Avatar author={author} size={48} verify={author.verified} />
      <div className="flex-1">
        <p className="font-semibold text-[#212121] dark:text-[#ffffff]">
          {author.name} {author.lastName}
        </p>
        <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
          @{author.username} | Se unió el: {formatLongDateMx(author.createdAt)}
        </p>
      </div>
    </>
  );
}

