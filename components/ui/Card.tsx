import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "parchment" | "dark";
}

export function Card({ className, variant = "dark", children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg shadow-tome",
        variant === "parchment"
          ? "bg-parchment border border-gold text-ink"
          : "bg-ink-light border border-gold/30 text-parchment-light",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
