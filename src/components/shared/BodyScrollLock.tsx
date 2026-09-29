"use client";

import { useEffect } from "react";

const LOCK_ATTR = "data-body-scroll-lock";

let lockCount = 0;
let previousBodyOverflow = "";
let previousHtmlOverflow = "";
let previousBodyPaddingRight = "";

function applyLock() {
  if (typeof document === "undefined") return;
  if (lockCount === 0) {
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    previousBodyOverflow = document.body.style.overflow;
    previousHtmlOverflow = document.documentElement.style.overflow;
    previousBodyPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (scrollbar > 0) {
      document.body.style.paddingRight = `${scrollbar}px`;
    }
  }
  lockCount += 1;
}

function releaseLock() {
  if (typeof document === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;
  document.body.style.overflow = previousBodyOverflow;
  document.documentElement.style.overflow = previousHtmlOverflow;
  document.body.style.paddingRight = previousBodyPaddingRight;
}

function shouldLockScroll() {
  return Boolean(
    document.querySelector('[aria-modal="true"]') ||
      document.querySelector(`[${LOCK_ATTR}]`),
  );
}

/**
 * Bloquea el scroll del fondo mientras haya un modal abierto.
 * Detecta `[aria-modal="true"]` o `[data-body-scroll-lock]` en el DOM.
 * Montarlo una sola vez en los providers de la app.
 */
export default function BodyScrollLock() {
  useEffect(() => {
    let locked = false;

    const sync = () => {
      const shouldLock = shouldLockScroll();
      if (shouldLock && !locked) {
        applyLock();
        locked = true;
      } else if (!shouldLock && locked) {
        releaseLock();
        locked = false;
      }
    };

    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-modal", LOCK_ATTR],
    });
    sync();

    return () => {
      observer.disconnect();
      if (locked) releaseLock();
    };
  }, []);

  return null;
}

export { LOCK_ATTR as BODY_SCROLL_LOCK_ATTR };
