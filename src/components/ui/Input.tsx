"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = "text", ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 text-zinc-100",
        "placeholder:text-zinc-500",
        "focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20",
        "transition-all",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...rest}
    />
  );
});
