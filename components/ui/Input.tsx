"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm text-parchment-light/70 font-cinzel">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          "bg-parchment-light/10 border border-gold/30 rounded px-3 py-2 text-parchment-light",
          "placeholder:text-parchment-light/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50",
          className
        )}
        {...props}
      />
    </div>
  )
);
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, id, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm text-parchment-light/70 font-cinzel">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          "bg-parchment-light/10 border border-gold/30 rounded px-3 py-2 text-parchment-light",
          "placeholder:text-parchment-light/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50 resize-y",
          className
        )}
        {...props}
      />
    </div>
  )
);
Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, id, options, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm text-parchment-light/70 font-cinzel">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={cn(
          "bg-parchment-light/10 border border-gold/30 rounded px-3 py-2 text-parchment-light",
          "focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-ink-light">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
);
Select.displayName = "Select";
