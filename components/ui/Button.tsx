"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "ghost" | "secondary";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary: "bg-gold hover:bg-gold-light text-ink font-bold",
  danger: "bg-blood hover:bg-blood-light text-parchment-light font-bold",
  ghost: "bg-transparent hover:bg-parchment/10 text-parchment-light",
  secondary: "bg-parchment-dark/20 hover:bg-parchment-dark/30 text-parchment-light border border-gold/30",
};

const sizes = {
  sm: "px-2 py-1 text-sm",
  md: "px-4 py-2",
  lg: "px-6 py-3 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "font-cinzel rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
