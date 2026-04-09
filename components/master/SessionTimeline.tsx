"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Plus, Trash2 } from "lucide-react";
import type { SessionEvent } from "@/types/dnd5e";
import { useI18n } from "@/lib/i18n";

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
  const { t } = useI18n();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<SessionEvent["type"]>("custom");

  const EVENT_TYPES = [
    { value: "combat", label: t.master.session.eventTypes.combat },
    { value: "social", label: t.master.session.eventTypes.social },
    { value: "exploration", label: t.master.session.eventTypes.exploration },
    { value: "plot", label: t.master.session.eventTypes.plot },
    { value: "custom", label: t.master.session.eventTypes.custom },
  ];

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
        <span className="font-cinzel text-xs text-gold/60 tracking-wider">{t.master.session.timeline}</span>
        <Button variant="ghost" size="sm" onClick={() => setShowModal(true)}>
          <Plus size={14} className="mr-1" /> {t.master.session.addEvent}
        </Button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-xs text-parchment-light/30 text-center py-4">{t.master.session.noEvents}</p>
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
                    <Badge label={EVENT_TYPES.find(et => et.value === event.type)?.label || event.type} color={EVENT_COLORS[event.type] || "blue"} />
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={t.master.session.addEvent}>
        <div className="space-y-3">
          <Input label={t.master.session.title} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <Select label={t.common.type} options={EVENT_TYPES} value={type} onChange={(e) => setType(e.target.value as SessionEvent["type"])} />
          <Textarea label={t.common.description} value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          <Button onClick={handleAdd} className="w-full" disabled={!title.trim()}>{t.master.session.addEvent}</Button>
        </div>
      </Modal>
    </div>
  );
}
