"use client";

type QtyStepperProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  label?: string;
};

export function QtyStepper({
  value,
  onChange,
  min = 1,
  label = "Quantity",
}: QtyStepperProps) {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-[26px] w-[26px] items-center justify-center rounded-md bg-brand-cream text-ink transition hover:bg-brand-blush"
        aria-label="Decrease quantity"
      >
        <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
          <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <span className="min-w-[14px] text-center text-[13px] font-semibold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-[26px] w-[26px] items-center justify-center rounded-md bg-brand-cream text-ink transition hover:bg-brand-blush"
        aria-label="Increase quantity"
      >
        <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
          <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
