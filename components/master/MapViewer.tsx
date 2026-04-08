"use client";

import { forwardRef, useRef } from "react";
import { Building2, Castle, Swords, Gem, User, MapPin } from "lucide-react";
import type { MapData, MapPin as MapPinType, PinType } from "@/types/dnd5e";

const PIN_ICONS: Record<PinType, React.ElementType> = {
  city: Building2,
  dungeon: Castle,
  encounter: Swords,
  treasure: Gem,
  npc: User,
  poi: MapPin,
};

const PIN_COLORS: Record<PinType, string> = {
  city: "text-blue-400 bg-blue-400/20 border-blue-400/50",
  dungeon: "text-purple-400 bg-purple-400/20 border-purple-400/50",
  encounter: "text-red-400 bg-red-400/20 border-red-400/50",
  treasure: "text-yellow-400 bg-yellow-400/20 border-yellow-400/50",
  npc: "text-green-400 bg-green-400/20 border-green-400/50",
  poi: "text-cyan-400 bg-cyan-400/20 border-cyan-400/50",
};

interface MapViewerProps {
  map: MapData;
  playerView: boolean;
  onMapClick: (x: number, y: number) => void;
  onPinClick: (pin: MapPinType) => void;
}

export const MapViewer = forwardRef<HTMLDivElement, MapViewerProps>(
  ({ map, playerView, onMapClick, onPinClick }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const visiblePins = playerView
      ? map.pins.filter((p) => p.revealed)
      : map.pins;

    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
      // Ignore if clicking on a pin button
      if ((e.target as HTMLElement).closest("[data-pin]")) return;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      onMapClick(
        Math.max(0, Math.min(100, x)),
        Math.max(0, Math.min(100, y))
      );
    };

    return (
      <div
        ref={(node) => {
          // Set both the forwarded ref and the local ref
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }
        }}
        className="relative w-full select-none cursor-crosshair"
        onClick={handleContainerClick}
      >
        {/* Map Image */}
        <img
          src={map.imageBase64}
          alt={map.name}
          className="w-full object-contain rounded"
          draggable={false}
        />

        {/* Pins */}
        {visiblePins.map((pin) => {
          const Icon = PIN_ICONS[pin.type];
          const colorClass = PIN_COLORS[pin.type];

          return (
            <div
              key={pin.id}
              data-pin="true"
              className="absolute group"
              style={{
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-ink-light border border-gold/30 rounded text-xs text-parchment-light font-cinzel whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {pin.name}
                {!pin.revealed && (
                  <span className="ml-1 text-parchment-light/40">(oculto)</span>
                )}
              </div>

              <button
                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-transform hover:scale-125 ${colorClass} ${
                  !pin.revealed ? "opacity-50 ring-1 ring-white/20" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPinClick(pin);
                }}
                title={pin.name}
              >
                <Icon size={14} />
              </button>
            </div>
          );
        })}
      </div>
    );
  }
);

MapViewer.displayName = "MapViewer";
