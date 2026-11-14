import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export type JimMood = "idle" | "listening" | "thinking" | "success";

type JimProps = {
  size?: "tiny" | "small" | "medium" | "large" | "hero";
  mood?: JimMood;
  label?: string;
  interactive?: boolean;
  onPoke?: () => void;
};

export function Jim({
  size = "medium",
  mood = "idle",
  label = "Jim, your AI business analyst",
  interactive = false,
  onPoke,
}: JimProps) {
  const reduceMotion = useReducedMotion();
  const [poked, setPoked] = useState(0);

  const handleInteract = () => {
    if (!interactive) return;
    setPoked((count) => count + 1);
    onPoke?.();
  };

  const activeMood = poked > 0 && mood === "idle" ? "success" : mood;

  return (
    <motion.div
      className={`jim jim--${size} jim--${activeMood} ${interactive ? "jim--interactive" : ""}`}
      role={interactive ? "button" : "img"}
      tabIndex={interactive ? 0 : undefined}
      aria-label={label}
      onClick={interactive ? handleInteract : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleInteract();
              }
            }
          : undefined
      }
      initial={reduceMotion ? false : { opacity: 0, scale: 0.82, rotate: -5 }}
      animate={
        reduceMotion
          ? { opacity: 1, scale: 1, rotate: 0 }
          : {
              opacity: 1,
              scale: 1,
              rotate: poked % 2 === 1 ? [0, -8, 7, -3, 0] : 0,
            }
      }
      whileHover={
        interactive && !reduceMotion
          ? { scale: 1.07, rotate: 3, transition: { type: "spring", stiffness: 360, damping: 15 } }
          : undefined
      }
      whileTap={
        interactive && !reduceMotion
          ? { scale: 0.91, rotate: -6 }
          : undefined
      }
      transition={{ type: "spring", stiffness: 200, damping: 16 }}
    >
      <span className="jim__orbit jim__orbit--one" aria-hidden="true"><i /></span>
      <span className="jim__orbit jim__orbit--two" aria-hidden="true"><i /></span>
      <div className="jim__body" aria-hidden="true">
        <span className="jim__shine" />
        <span className="jim__eye jim__eye--left" />
        <span className="jim__eye jim__eye--right" />
        <span className="jim__mouth" />
        <span className="jim__spark">✦</span>
      </div>
      <span className="jim__shadow" aria-hidden="true" />
    </motion.div>
  );
}
