"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = "Buscar..." }: SearchBarProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => onSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="relative">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/40" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 bg-parchment/10 border border-gold/30 rounded-lg text-parchment-light placeholder:text-parchment-light/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50"
      />
      {query && (
        <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment-light/40 hover:text-parchment-light">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
