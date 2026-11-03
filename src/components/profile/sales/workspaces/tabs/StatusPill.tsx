export default function StatusPill({ label }: { label: string }) {
  return (
    <span className="inline-flex max-w-full truncate rounded-full bg-dash-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-dash-soft">
      {label}
    </span>
  );
}

