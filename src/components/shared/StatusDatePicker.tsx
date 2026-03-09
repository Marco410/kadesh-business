"use client";

import { DatePicker } from '@heroui/date-picker';
import { CalendarDateTime, parseDateTime } from '@internationalized/date';
import type { ComponentProps } from 'react';

export const dateToCalendarDateTime = (date: Date): CalendarDateTime =>
  new CalendarDateTime(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  );

export const calendarDateTimeToStr = (v: CalendarDateTime): string => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${v.year}-${p(v.month)}-${p(v.day)}T${p(v.hour)}:${p(v.minute)}`;
};

export interface StatusDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  errorMessage?: string;
  popoverScopeClass?: string;
}

export default function StatusDatePicker({
  value,
  onChange,
  isDisabled = false,
  errorMessage,
  popoverScopeClass = 'status-date-picker-popover',
}: StatusDatePickerProps) {
  return (
    <DatePicker
      label=""
      placeholderValue={dateToCalendarDateTime(new Date())}
      value={value ? parseDateTime(value) : null}
      defaultValue={dateToCalendarDateTime(new Date())}
      maxValue={dateToCalendarDateTime(new Date()) as ComponentProps<typeof DatePicker>['maxValue']}
      granularity="minute"
      isDisabled={isDisabled}
      isInvalid={!!errorMessage}
      errorMessage={errorMessage}
      onChange={(v) => v != null && onChange(calendarDateTimeToStr(v as CalendarDateTime))}
      variant="bordered"
      color="default"
      size="lg"
      radius="lg"
      popoverProps={{
        classNames: { content: '!z-[250]' },
        portalContainer: typeof document !== 'undefined' ? document.body : undefined,
      }}
      classNames={{
        base: `w-full ${isDisabled ? 'opacity-75 cursor-not-allowed' : ''}`,
        input: `text-[#212121] dark:text-[#ffffff] ${isDisabled ? 'cursor-not-allowed' : ''}`,
        inputWrapper: [
          'min-h-12 border-2 rounded-lg border-[#c5c5c5] dark:border-[#3a3a3a]',
          'bg-[#fafafa] dark:bg-[#121212]',
          !isDisabled && 'data-[hover=true]:border-[#a8a8a8] dark:data-[hover=true]:border-[#4a4a4a]',
          !isDisabled &&
            'group-data-[focus=true]:border-orange-500 group-data-[focus=true]:ring-2 group-data-[focus=true]:ring-orange-500/20',
          'shadow-sm dark:shadow-none',
          isDisabled &&
            'bg-[#eeeeee] dark:bg-[#2a2a2a] border-[#d0d0d0] dark:border-[#404040] cursor-not-allowed',
        ]
          .filter(Boolean)
          .join(' '),
        popoverContent: `${popoverScopeClass} !z-[250] !bg-white dark:!bg-[#1e1e1e] !shadow-xl border border-[#e0e0e0] dark:border-[#3a3a3a] rounded-xl overflow-hidden`,
        calendar: 'bg-white dark:bg-[#1e1e1e]',
        calendarContent: 'bg-white dark:bg-[#1e1e1e]',
      }}
      calendarProps={{
        classNames: {
          cellButton: [
            'w-9 h-9 text-[#212121] dark:text-[#e0e0e0]',
            'data-[data-selected=true]:bg-orange-500 data-[data-selected=true]:text-white data-[data-selected=true]:font-semibold',
            'data-[data-disabled=true]:opacity-40 data-[data-disabled=true]:cursor-not-allowed data-[data-disabled=true]:line-through data-[data-disabled=true]:text-[#616161] dark:data-[data-disabled=true]:text-[#808080]',
            'data-[data-outside-month=true]:text-[#9e9e9e] dark:data-[data-outside-month=true]:text-[#606060]',
          ].join(' '),
        },
      }}
    />
  );
}
