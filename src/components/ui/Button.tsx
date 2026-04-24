"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center rounded-lg transition-all font-medium focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

const variants: Record<Variant, string> = {
  primary: cn(
    "bg-gradient-to-br from-purple-500 to-violet-600 text-white",
    "hover:from-purple-400 hover:to-violet-500",
    "hover:shadow-[0_0_24px_rgba(167,139,250,0.45)]",
    "focus:ring-purple-500/50 active:scale-[0.98]"
  ),
  ghost: cn(
    "bg-transparent text-zinc-200",
    "hover:bg-zinc-800/60 hover:text-white",
    "focus:ring-zinc-600"
  ),
  outline: cn(
    "bg-transparent text-zinc-100 border border-zinc-700",
    "hover:border-purple-500/60 hover:bg-purple-500/5 hover:text-white",
    "focus:ring-purple-500/40"
  ),
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", type = "button", ...rest },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(base, variants[variant], sizes[size], className)}
        {...rest}
      />
    );
  }
);
