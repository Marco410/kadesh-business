export default function StatusPill({ label }: { label: string }) {
  return (
    <span className="inline-flex max-w-full truncate rounded-full bg-[#f0f0f0] dark:bg-[#333] px-2.5 py-0.5 text-[11px] font-medium text-[#424242] dark:text-[#e0e0e0]">
      {label}
    </span>
  );
}

