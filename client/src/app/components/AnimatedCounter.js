"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

export default function AnimatedCounter({ value, duration = 1.4, className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState("0");

  const numeric = parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
  const prefix = String(value).match(/^[^0-9]*/)?.[0] || "";
  const suffix = String(value).match(/[^0-9]*$/)?.[0] || "";
  const hasComma = /,/.test(String(value));

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, numeric, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        const rounded = Math.round(v);
        setDisplay(hasComma ? rounded.toLocaleString("en-IN") : String(rounded));
      },
    });
    return () => controls.stop();
  }, [isInView, numeric, duration, hasComma]);

  return (
    <span ref={ref} className={className}>
      {prefix}{display}{suffix}
    </span>
  );
}
