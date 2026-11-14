import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button type="button" className={`theme-toggle ${className}`} onClick={toggleTheme} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={theme} className="theme-toggle__icon" initial={reduceMotion ? false : { opacity: 0, rotate: -70, scale: 0.6 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0, rotate: 70, scale: 0.6 }} transition={{ duration: 0.18 }}>
          {theme === "dark" ? <Moon size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
