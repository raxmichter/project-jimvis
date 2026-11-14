import { useLayoutEffect, useRef, useState } from "react";
import { ArrowUp, ChevronDown, Check, Sparkles } from "lucide-react";
import { Popover, PopoverClose, PopoverContent, PopoverTitle, PopoverTrigger } from "@ui-sdk/react/popover";
import type { ReportKind } from "@contracts/report";

type Kind = ReportKind | "auto";

const modes: { value: Kind; label: string; detail: string }[] = [
  { value: "auto", label: "Auto-detect", detail: "Let Jim choose the best lens" },
  { value: "performance", label: "Performance", detail: "Revenue, funnel and margin" },
  { value: "retention", label: "Retention", detail: "Churn, activation and cohorts" },
  { value: "market", label: "Market", detail: "Expansion and entry strategy" },
];

export function Composer({ value, onChange, onSubmit, disabled, compact = false }: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (kind: Kind) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const [kind, setKind] = useState<Kind>("auto");
  const [modeOpen, setModeOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selected = modes.find((mode) => mode.value === kind) ?? modes[0];
  const canSend = !disabled && value.trim().length >= 8;

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    const minHeight = compact ? 38 : 48;
    el.style.height = `${Math.min(150, Math.max(minHeight, el.scrollHeight))}px`;
  }, [value, compact]);

  return (
    <div className={`composer-shell ${compact ? "composer-shell--compact" : ""}`}>
      <div className="composer">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (canSend) onSubmit(kind);
            }
          }}
          placeholder={compact ? "Ask a follow-up or request a new brief…" : "Ask Jim about growth, churn, or a market…"}
          aria-label="Describe the business report you need"
          rows={1}
          maxLength={800}
          disabled={disabled}
        />
        <div className="composer__toolbar">
          <Popover open={modeOpen} onOpenChange={setModeOpen}>
            <PopoverTrigger className={`mode-trigger ${kind !== "auto" ? "mode-trigger--active" : ""}`} disabled={disabled} aria-label="Choose report type">
              <Sparkles size={15} aria-hidden="true" />
              <span>{selected.label}</span>
              <ChevronDown size={14} aria-hidden="true" />
            </PopoverTrigger>
            <PopoverContent side="top" align="start" sideOffset={10} className="mode-menu">
              <PopoverTitle>Choose Jim’s lens</PopoverTitle>
              <div className="mode-menu__list">
                {modes.map((mode) => (
                  <PopoverClose
                    key={mode.value}
                    className={`mode-option ${kind === mode.value ? "is-selected" : ""}`}
                    onClick={() => {
                      setKind(mode.value);
                      setModeOpen(false);
                    }}
                  >
                    <span><strong>{mode.label}</strong><small>{mode.detail}</small></span>
                    {kind === mode.value && <Check size={16} aria-hidden="true" />}
                  </PopoverClose>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <span className="composer-hint">Enter to send · Shift + Enter for new line</span>
          <button
            type="button"
            className="send-button"
            aria-label="Generate business report"
            disabled={!canSend}
            onClick={() => onSubmit(kind)}
          >
            <ArrowUp size={19} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>
      </div>
      <p className="prototype-note">Prototype analysis uses illustrative data. Verify decisions with your source data.</p>
    </div>
  );
}
