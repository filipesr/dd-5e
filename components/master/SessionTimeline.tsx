"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Plus, Trash2 } from "lucide-react";
import type { SessionEvent } from "@/types/dnd5e";

const EVENT_TYPES = [
  { value: "combat", label: "Combate" },
  { value: "social", label: "Social" },
  { value: "exploration", label: "Exploração" },
  { value: "plot", label: "Revelação de Plot" },
  { value: "custom", label: "Outro" },
];

const EVENT_COLORS: Record<string, "blood" | "gold" | "green" | "purple" | "blue"> = {
  combat: "blood",
  social: "gold",
  exploration: "green",
  plot: "purple",
  custom: "blue",
};

interface SessionTimelineProps {
  events: SessionEvent[];
  onAddEvent: (event: Omit<SessionEvent, "id">) => void;
  onDeleteEvent: (eventId: string) => void;
}

export function SessionTimeline({ events, onAddEvent, onDeleteEvent }: SessionTimelineProps) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<SessionEvent["type"]>("custom");

  const handleAdd = () => {
    if (!title.trim()) return;
    onAddEvent({
      timestamp: new Date().toISOString(),
      type,
      title: title.trim(),
      description: description.trim(),
    });
    setTitle("");
    setDescription("");
    setType("custom");
    setShowModal(false);
  };

  const sorted = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="font-cinzel text-xs text-gold/60 tracking-wider">Timeline</span>
        <Button variant="ghost" size="sm" onClick={() => setShowModal(true)}>
          <Plus size={14} className="mr-1" /> Evento
        </Button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-xs text-parchment-light/30 text-center py-4">Nenhum evento registrado</p>
      ) : (
        <div className="relative pl-6 space-y-3">
          {/* Vertical line */}
          <div className="absolute left-2 top-0 bottom-0 w-px bg-gold/20" />

          {sorted.map((event) => (
            <div key={event.id} className="relative">
              {/* Dot */}
              <div className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-gold/40 bg-ink-light flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-gold/60" />
              </div>

              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge label={EVENT_TYPES.find(t => t.value === event.type)?.label || event.type} color={EVENT_COLORS[event.type] || "blue"} />
                    <span className="font-cinzel text-sm text-parchment-light">{event.title}</span>
                  </div>
                  {event.description && (
                    <p className="text-xs text-parchment-light/50 mt-1">{event.description}</p>
                  )}
                  <p className="text-xs text-parchment-light/30 mt-0.5">
                    {new Date(event.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <button onClick={() => onDeleteEvent(event.id)} className="text-blood/30 hover:text-blood transition-colors flex-shrink-0">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Novo Evento">
        <div className="space-y-3">
          <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <Select label="Tipo" options={EVENT_TYPES} value={type} onChange={(e) => setType(e.target.value as SessionEvent["type"])} />
          <Textarea label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          <Button onClick={handleAdd} className="w-full" disabled={!title.trim()}>Adicionar Evento</Button>
        </div>
      </Modal>
    </div>
  );
}
