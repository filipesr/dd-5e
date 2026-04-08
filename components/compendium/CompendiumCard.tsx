import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface CompendiumCardProps {
  href: string;
  name: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}

export function CompendiumCard({ href, name, subtitle, description, icon: Icon, className }: CompendiumCardProps) {
  return (
    <Link href={href} className={cn("card-medieval p-4 hover:shadow-tome-hover transition-shadow block", className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="p-2 bg-gold/10 rounded">
            <Icon size={20} className="text-gold" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-cinzel text-sm font-bold text-ink truncate">{name}</h3>
          {subtitle && <p className="text-xs text-ink/60 mt-0.5">{subtitle}</p>}
          {description && <p className="text-xs text-ink/50 mt-1 line-clamp-2">{description}</p>}
        </div>
      </div>
    </Link>
  );
}
