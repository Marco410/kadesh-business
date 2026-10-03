import type { CSSProperties } from "react";
import { Navigation } from "kadesh/components/layout";
import { cn } from "kadesh/utils/cn";

const boneClass =
  "motion-safe:animate-pulse rounded-md bg-[#ececec] dark:bg-[#2a2a2a]";

function Bone({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <div className={cn(boneClass, className)} style={style} />;
}

const cardClass =
  "rounded-2xl border border-[#e0e0e0] bg-white shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e]";

const SIDEBAR_ROWS = [46, 62, 38, 54, 70, 44, 58, 42];

function SidebarCard({
  widths,
  markFirst = false,
}: {
  widths: number[];
  markFirst?: boolean;
}) {
  return (
    <div className={cn(cardClass, "p-2")}>
      {widths.map((width, index) => {
        const isActive = markFirst && index === 0;
        return (
          <div
            key={width}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-4",
              isActive && "bg-orange-500/15",
            )}
          >
            <Bone
              className={cn(
                "size-5 shrink-0 rounded-md",
                isActive && "bg-orange-200 dark:bg-orange-500/30",
              )}
            />
            <Bone
              className={cn(
                "h-3.5",
                isActive && "bg-orange-200 dark:bg-orange-500/30",
              )}
              style={{ width: `${width}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

function KpiBone() {
  return (
    <div className="space-y-2 px-1 py-1">
      <Bone className="h-3 w-16" />
      <Bone className="h-7 w-12" />
      <Bone className="h-3 w-20" />
    </div>
  );
}

function PanelControlSkeletonBody({ embedded }: { embedded: boolean }) {
  return (
    <div
      className={embedded ? undefined : "px-4 pt-20 pb-12 sm:px-6 lg:px-10"}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Cargando panel</span>
      {!embedded ? (
        <div className="mb-8 space-y-2">
          <Bone className="h-8 w-52" />
          <Bone className="h-4 w-64" />
        </div>
      ) : null}
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col gap-5 lg:w-60">
          <SidebarCard widths={SIDEBAR_ROWS} markFirst />
          <SidebarCard widths={[52, 64]} />
        </aside>
        <div className="min-w-0 flex-1 space-y-4">
          <div
            className={cn(
              cardClass,
              "bg-gradient-to-br from-orange-500/10 to-orange-600/5 px-5 py-4 dark:from-orange-500/20 dark:to-transparent",
            )}
          >
            <Bone className="h-3.5 w-28" />
            <Bone className="mt-2 h-7 w-44" />
            <Bone className="mt-2 h-3.5 w-52" />
          </div>
          <div className={cn(cardClass, "p-4")}>
            <div className="flex items-start gap-3">
              <Bone className="size-6 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Bone className="h-4 w-40" />
                <Bone className="h-3.5 w-full max-w-md" />
                <Bone className="h-3.5 w-2/3 max-w-xs" />
              </div>
            </div>
          </div>
          <div className={cn(cardClass, "p-4")}>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              {Array.from({ length: 5 }, (_, index) => (
                <KpiBone key={index} />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className={cn(cardClass, "h-52 p-4 lg:col-span-3")}>
              <Bone className="h-4 w-36" />
              <Bone className="mt-4 h-32 w-full rounded-xl" />
            </div>
            <div className={cn(cardClass, "h-52 p-4 lg:col-span-2")}>
              <Bone className="h-4 w-32" />
              <Bone className="mt-4 h-32 w-full rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className={cn(cardClass, "h-40 p-4")}>
              <Bone className="h-4 w-40" />
              <Bone className="mt-4 h-3.5 w-full" />
              <Bone className="mt-2 h-3.5 w-4/5" />
              <Bone className="mt-2 h-3.5 w-3/5" />
            </div>
            <div className={cn(cardClass, "h-40 p-4")}>
              <Bone className="h-4 w-36" />
              <Bone className="mt-4 h-3.5 w-full" />
              <Bone className="mt-2 h-3.5 w-4/5" />
              <Bone className="mt-2 h-3.5 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PanelControlSkeleton({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  if (embedded) return <PanelControlSkeletonBody embedded />;

  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a0a]">
      <Navigation />
      <PanelControlSkeletonBody embedded={false} />
    </div>
  );
}
