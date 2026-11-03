"use client";

interface StatItemProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
}

export default function StatItem({ label, value, icon }: StatItemProps) {
  return (
    <div className="flex items-center gap-2">
      {icon && (
        <span className="text-dash-muted">{icon}</span>
      )}
      <div>
        <p className="text-xs text-dash-muted">{label}</p>
        <p className="text-lg font-semibold text-dash-ink tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}
