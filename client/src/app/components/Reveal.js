"use client";
import { motion } from "framer-motion";

const DIRECTIONS = {
  up: { y: 28, x: 0 },
  down: { y: -28, x: 0 },
  left: { y: 0, x: 28 },
  right: { y: 0, x: -28 },
  none: { y: 0, x: 0 },
};

export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  className = "",
  once = true,
  amount = 0.2,
  as = "div",
}) {
  const offset = DIRECTIONS[direction] || DIRECTIONS.up;
  const MotionTag = motion[as] || motion.div;

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

// By default the stagger reveals when scrolled into view (good for static
// page sections). Pass triggerOnMount for content that swaps in via state
// (e.g. pagination) rather than scrolling — whileInView only fires once per
// viewport entry, so newly-mounted children after that point never get
// animated in and stay stuck invisible.
export function Stagger({ children, className = "", delayChildren = 0, staggerChildren = 0.08, once = true, amount = 0.2, triggerOnMount = false }) {
  const variants = {
    hidden: {},
    show: { transition: { staggerChildren, delayChildren } },
  };

  if (triggerOnMount) {
    return (
      <motion.div className={className} initial="hidden" animate="show" variants={variants}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "", direction = "up" }) {
  const offset = DIRECTIONS[direction] || DIRECTIONS.up;
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, x: offset.x, y: offset.y },
        show: { opacity: 1, x: 0, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}
