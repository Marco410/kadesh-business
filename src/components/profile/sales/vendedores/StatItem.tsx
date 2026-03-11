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
        <span className="text-[#616161] dark:text-[#b0b0b0]">{icon}</span>
      )}
      <div>
        <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">{label}</p>
        <p className="text-lg font-semibold text-[#212121] dark:text-white tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}
