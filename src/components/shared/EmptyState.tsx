interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
}

export default function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {icon && (
        <div className="text-6xl mb-4">{icon}</div>
      )}
      <h3 className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mb-2">
        {title}
      </h3>
      <p className="text-[#616161] dark:text-[#b0b0b0] text-center max-w-md">
        {description}
      </p>
    </div>
  );
}
