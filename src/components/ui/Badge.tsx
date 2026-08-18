export function Badge({
  label,
  color,
  className = "",
}: {
  label: string;
  color: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-sm ${className}`}
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}
