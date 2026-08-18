import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  fullWidth?: boolean;
};

const VARIANTS: Record<string, string> = {
  primary:
    "bg-imla-accent text-white hover:bg-imla-accent-dark shadow-md shadow-imla-accent/30",
  secondary:
    "glass text-foreground hover:bg-white/70 dark:hover:bg-white/10",
  ghost: "bg-transparent hover:bg-black/5 dark:hover:bg-white/10",
  danger: "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/30",
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${VARIANTS[variant]} ${
        fullWidth ? "w-full" : ""
      } rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  );
}
