"use client";

import { useLayoutEffect, useRef, useState } from "react";

type ExpandableCopyProps = {
  text: string;
  lines?: 2 | 3;
};

/**
 * Cuerpo largo que se escanea en 2 líneas y se abre al hacer clic.
 * “Ver más” solo si el clamp realmente recorta texto.
 */
export function ExpandableCopy({ text, lines = 2 }: ExpandableCopyProps) {
  const [open, setOpen] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);
  const clamp = lines === 3 ? "line-clamp-3" : "line-clamp-2";

  useLayoutEffect(() => {
    setOpen(false);
  }, [text]);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el || open) return;

    const measure = () => {
      setCanExpand(el.scrollHeight > el.clientHeight + 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, lines, open]);

  return (
    <div>
      <span
        ref={textRef}
        className={
          open
            ? "block text-sm leading-snug text-[#616161] dark:text-[#b0b0b0]"
            : `block ${clamp} text-sm leading-snug text-[#616161] dark:text-[#b0b0b0]`
        }
      >
        {text}
      </span>
      {canExpand ? (
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="mt-0.5 text-xs font-medium text-orange-600 hover:underline dark:text-orange-400"
          aria-expanded={open}
        >
          {open ? "Ver menos" : "Ver más"}
        </button>
      ) : null}
    </div>
  );
}
