"use client";

import { motion } from "framer-motion";

type DemoCursorProps = {
  x: number;
  y: number;
  visible: boolean;
  clicking: boolean;
};

export default function DemoCursor({ x, y, visible, clicking }: DemoCursorProps) {
  if (!visible) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none absolute z-30"
        style={{ left: `${x}%`, top: `${y}%` }}
        animate={{ scale: clicking ? 0.85 : 1 }}
        transition={{ duration: 0.12 }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          className="drop-shadow-lg -translate-x-1 -translate-y-1"
          aria-hidden
        >
          <path
            d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z"
            fill="#212121"
            stroke="#fff"
            strokeWidth="1.5"
          />
        </svg>
      </motion.div>

      {clicking && (
        <motion.span
          className="pointer-events-none absolute z-20 h-8 w-8 rounded-full border-2 border-orange-500 bg-orange-500/20"
          style={{ left: `${x}%`, top: `${y}%` }}
          initial={{ scale: 0.4, opacity: 0.9 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        />
      )}
    </>
  );
}
