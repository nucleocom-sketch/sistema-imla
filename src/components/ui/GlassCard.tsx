import { HTMLAttributes } from "react";

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  strong?: boolean;
  hover?: boolean;
};

export function GlassCard({
  className = "",
  strong = false,
  hover = false,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`${strong ? "glass-strong" : "glass"} ${
        hover ? "glass-hover" : ""
      } rounded-3xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
