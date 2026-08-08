"use client";
import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

// Wires the standard overlay a11y trio for a drawer/dropdown/popover: Escape
// closes it, Tab is trapped inside it while open, and focus returns to
// whatever triggered it on close. Attach the returned ref to the overlay's
// outermost element. `onClose` doesn't need to be memoized by the caller —
// the effect only re-subscribes when `isOpen` itself flips.
export function useDismissableOverlay(isOpen, onClose) {
  const containerRef = useRef(null);
  const previouslyFocused = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return undefined;

    previouslyFocused.current = document.activeElement;

    const getFocusable = () =>
      containerRef.current ? Array.from(containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR)) : [];

    const first = getFocusable()[0];
    (first || containerRef.current)?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key === "Tab") {
        const items = getFocusable();
        if (!items.length) return;
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      if (previouslyFocused.current && typeof previouslyFocused.current.focus === "function") {
        previouslyFocused.current.focus();
      }
    };
  }, [isOpen]);

  return containerRef;
}
