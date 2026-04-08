"use client";

import { forwardRef, useRef } from "react";
import { Building2, Castle, Swords, Gem, User, MapPin, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
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
  city: "text-white bg-blue-600/90 border-blue-300 shadow-[0_0_12px_rgba(96,165,250,0.7)]",
  dungeon: "text-white bg-purple-600/90 border-purple-300 shadow-[0_0_12px_rgba(192,132,252,0.7)]",
  encounter: "text-white bg-red-600/90 border-red-300 shadow-[0_0_12px_rgba(252,165,165,0.7)]",
  treasure: "text-white bg-yellow-600/90 border-yellow-300 shadow-[0_0_12px_rgba(253,224,71,0.7)]",
  npc: "text-white bg-green-600/90 border-green-300 shadow-[0_0_12px_rgba(134,239,172,0.7)]",
  poi: "text-white bg-cyan-600/90 border-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.7)]",
};

const PIN_TYPE_LABELS: Record<PinType, string> = {
  city: "Cidade",
  dungeon: "Masmorra",
  encounter: "Encontro",
  treasure: "Tesouro",
  npc: "NPC",
  poi: "Ponto de Interesse",
};

const PIN_BADGE_COLORS: Record<PinType, "blue" | "purple" | "blood" | "gold" | "green"> = {
  city: "blue",
  dungeon: "purple",
  encounter: "blood",
  treasure: "gold",
  npc: "green",
  poi: "blue",
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
      <>
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
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-130 ${colorClass} ${
                  !pin.revealed ? "opacity-40 ring-2 ring-white/20" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPinClick(pin);
                }}
                title={pin.name}
              >
                <Icon size={18} strokeWidth={2.5} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Pin List */}
      {visiblePins.length > 0 && (
        <div className="mt-4 border border-gold/20 rounded-lg overflow-hidden">
          <div className="px-3 py-2 bg-ink-light border-b border-gold/10">
            <span className="font-cinzel text-xs text-gold/60 tracking-wider">
              Pinos ({visiblePins.length})
            </span>
          </div>
          <div className="divide-y divide-gold/5 max-h-48 overflow-y-auto">
            {visiblePins.map((pin) => {
              const Icon = PIN_ICONS[pin.type];
              return (
                <button
                  key={pin.id}
                  onClick={() => onPinClick(pin)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-parchment/5 transition-colors text-left"
                >
                  <Icon size={14} className={PIN_COLORS[pin.type].split(" ")[0]} />
                  <span className="flex-1 text-sm text-parchment-light truncate">{pin.name}</span>
                  <Badge label={PIN_TYPE_LABELS[pin.type]} color={PIN_BADGE_COLORS[pin.type]} />
                  {!pin.revealed && <EyeOff size={12} className="text-parchment-light/30" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
    );
  }
);

MapViewer.displayName = "MapViewer";
