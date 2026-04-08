import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  className?: string;
}

export function SectionHeader({ title, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center gap-3 mb-4", className)}>
      <div className="h-px flex-1 bg-gold/30" />
      <h2 className="font-cinzel text-gold text-xl tracking-wider">{title}</h2>
      <div className="h-px flex-1 bg-gold/30" />
    </div>
  );
}
