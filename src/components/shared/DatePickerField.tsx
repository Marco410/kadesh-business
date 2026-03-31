"use client";

import { DatePicker } from "@heroui/date-picker";
import {
  CalendarDate,
  CalendarDateTime,
  getLocalTimeZone,
  parseDate,
  parseDateTime,
  today,
} from "@internationalized/date";
import type { ComponentProps } from "react";
import {
  calendarDateTimeToStr,
  dateToCalendarDateTime,
} from "./StatusDatePicker";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Convierte un `CalendarDate` a `YYYY-MM-DD` (compatible con inputs nativos). */
export function calendarDateToDateOnlyString(v: CalendarDate): string {
  return `${v.year}-${pad2(v.month)}-${pad2(v.day)}`;
}

function normalizeDateOnlyInput(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  return t.includes("T") ? t.slice(0, 10) : t;
}

function safeParseDate(raw: string): CalendarDate | null {
  const d = normalizeDateOnlyInput(raw);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  try {
    return parseDate(d);
  } catch {
    return null;
  }
}

function safeParseDateTime(raw: string): CalendarDateTime | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    const normalized =
      t.length === 10
        ? `${t}T00:00`
        : t.includes("T")
          ? t.slice(0, 16)
          : t;
    return parseDateTime(normalized);
  } catch {
    return null;
  }
}

export type HeroUIDatePickerGranularity = "day" | "minute";

export interface HeroUIDatePickerFieldProps {
  id?: string;
  /** Texto visible del campo (HeroUI). Si vacío, usa solo `aria-label` / `ariaLabel`. */
  label?: string;
  /** Accesibilidad cuando `label` está vacío y el `<label>` está fuera del componente. */
  ariaLabel?: string;
  value: string;
  onChange: (value: string) => void;
  /** `day` → `YYYY-MM-DD`; `minute` → `YYYY-MM-DDTHH:mm` (hora local, mismo criterio que `StatusDatePicker`). */
  granularity: HeroUIDatePickerGranularity;
  isDisabled?: boolean;
  errorMessage?: string;
  className?: string;
  /** Sube el z-index del popover (útil sobre tablas o sticky headers). */
  highZIndex?: boolean;
}

/**
 * Selector de fecha con [@heroui/date-picker](https://www.heroui.com/docs/react/components/date-picker)
 * (API HeroUI v2 del proyecto): modo solo fecha o fecha + hora.
 */
export default function DatePickerField({
  id,
  label = "",
  ariaLabel,
  value,
  onChange,
  granularity,
  isDisabled = false,
  errorMessage,
  className = "",
  highZIndex = true,
}: HeroUIDatePickerFieldProps) {
  const placeholderDay = today(getLocalTimeZone());
  const placeholderDateTime = dateToCalendarDateTime(new Date());
  const isDay = granularity === "day";
  const parsedValue = isDay ? safeParseDate(value) : safeParseDateTime(value);
  const a11y = ariaLabel || label || "Fecha";

  return (
    <DatePicker
      id={id}
      label={label}
      aria-label={label ? undefined : a11y}
      placeholderValue={isDay ? placeholderDay : placeholderDateTime}
      value={parsedValue as ComponentProps<typeof DatePicker>["value"]}
      granularity={granularity}
      isDisabled={isDisabled}
      isInvalid={!!errorMessage}
      errorMessage={errorMessage}
      onChange={(v) => {
        if (v == null) {
          onChange("");
          return;
        }
        if (isDay) {
          onChange(calendarDateToDateOnlyString(v as CalendarDate));
          return;
        }
        onChange(calendarDateTimeToStr(v as CalendarDateTime));
      }}
      variant="bordered"
      color="primary"
      size="md"
      radius="lg"
      className={`w-full max-w-full ${className}`}
      popoverProps={{
        classNames: {
          content: highZIndex ? "!z-[260]" : undefined,
        },
        portalContainer:
          typeof document !== "undefined" ? document.body : undefined,
      }}
      classNames={{
        base: `w-full max-w-full ${isDisabled ? "opacity-75" : ""}`,
        label: label
          ? "text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5"
          : "sr-only",
        popoverContent: highZIndex ? "!z-[260]" : undefined,
      }}
    />
  );
}
