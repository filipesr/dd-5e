"use client";

import { Badge } from "@/components/ui/Badge";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterPanelProps {
  groups: FilterGroup[];
  activeFilters: Record<string, string[]>;
  onFilterChange: (key: string, values: string[]) => void;
}

export function FilterPanel({ groups, activeFilters, onFilterChange }: FilterPanelProps) {
  const toggleFilter = (key: string, value: string) => {
    const current = activeFilters[key] || [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onFilterChange(key, next);
  };

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.key}>
          <h4 className="font-cinzel text-xs text-gold/60 mb-2 tracking-wider">{group.label}</h4>
          <div className="flex flex-wrap gap-1">
            {group.options.map((opt) => (
              <Badge key={opt.value} label={opt.label} active={(activeFilters[group.key] || []).includes(opt.value)} onClick={() => toggleFilter(group.key, opt.value)} color="gold" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
