const CAMINHO_ONDA =
  "M0 10 Q 12.5 0 25 10 T 50 10 T 75 10 T 100 10 T 125 10 T 150 10 T 175 10 T 200 10 V20 H0 Z";

type WaveIndicatorProps = {
  /** 0 a 100 */
  percent: number;
  label?: string;
  sublabel?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const TAMANHOS = {
  sm: "h-16 w-14",
  md: "h-20 w-16",
  lg: "h-28 w-24",
};

export function WaveIndicator({
  percent,
  label,
  sublabel,
  size = "md",
  className = "",
}: WaveIndicatorProps) {
  const pct = Math.max(4, Math.min(100, percent));

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-imla-teal/25 bg-white/40 dark:bg-white/5 ${TAMANHOS[size]} ${className}`}
    >
      <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ height: `${pct}%` }}>
        <div className="absolute inset-0 top-[6px] bg-gradient-to-b from-imla-teal to-imla-teal-dark" />
        <svg
          className="imla-wave-anim absolute bottom-[calc(100%-8px)] left-0 h-3 w-[200%] text-imla-teal"
          viewBox="0 0 200 20"
          preserveAspectRatio="none"
        >
          <path d={CAMINHO_ONDA} fill="currentColor" />
        </svg>
        <svg
          className="imla-wave-anim-slow absolute bottom-[calc(100%-6px)] left-0 h-3 w-[200%] text-imla-teal-dark opacity-70"
          viewBox="0 0 200 20"
          preserveAspectRatio="none"
        >
          <path d={CAMINHO_ONDA} fill="currentColor" />
        </svg>
      </div>

      {(label || sublabel) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end gap-0.5 p-1 text-center">
          {label && (
            <span className="text-[10px] font-extrabold leading-tight text-foreground drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]">
              {label}
            </span>
          )}
          {sublabel && (
            <span className="text-[8px] font-bold uppercase leading-tight text-foreground/60">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
