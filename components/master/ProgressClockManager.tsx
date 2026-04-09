"use client";

import { useState } from "react";
import { Trash2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { ProgressClock } from "@/components/master/ProgressClock";
import type { ProgressClock as ProgressClockType } from "@/types/dnd5e";
import { useI18n } from "@/lib/i18n";

interface ProgressClockManagerProps {
  clocks: ProgressClockType[];
  onAdd: (name: string, segments: number) => void;
  onUpdate: (clockId: string, filled: number) => void;
  onDelete: (clockId: string) => void;
}

export function ProgressClockManager({ clocks, onAdd, onUpdate, onDelete }: ProgressClockManagerProps) {
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSegments, setNewSegments] = useState("6");

  const SEGMENT_OPTIONS = [
    { value: "4", label: t.master.clock.seg4 },
    { value: "6", label: t.master.clock.seg6 },
    { value: "8", label: t.master.clock.seg8 },
  ];

  const handleCreate = () => {
    if (!newName.trim()) return;
    onAdd(newName.trim(), Number(newSegments));
    setNewName("");
    setNewSegments("6");
    setShowForm(false);
  };

  const handleSegmentClick = (clock: ProgressClockType, index: number) => {
    // Clicking a segment: if index < filled, set filled to index (unfill), else set filled to index+1 (fill up to)
    const newFilled = index < clock.filled ? index : index + 1;
    onUpdate(clock.id, Math.max(0, Math.min(newFilled, clock.segments)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-cinzel text-parchment-light/60 uppercase tracking-wide">
          {t.master.clock.title}
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(!showForm)}>
          <PlusCircle size={14} className="mr-1" /> {t.master.clock.new_}
        </Button>
      </div>

      {showForm && (
        <div className="flex items-end gap-3 p-3 bg-ink border border-gold/20 rounded-lg">
          <div className="flex-1">
            <Input
              label={t.common.name}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Ritual do inimigo"
            />
          </div>
          <div className="w-40">
            <Select
              label="Segmentos"
              options={SEGMENT_OPTIONS}
              value={newSegments}
              onChange={(e) => setNewSegments(e.target.value)}
            />
          </div>
          <div className="flex gap-2 pb-0.5">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              {t.common.cancel}
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>
              {t.common.create}
            </Button>
          </div>
        </div>
      )}

      {clocks.length === 0 && !showForm && (
        <p className="text-xs text-parchment-light/30 italic">
          Nenhum relogio de progresso criado ainda.
        </p>
      )}

      {clocks.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {clocks.map((clock) => (
            <div
              key={clock.id}
              className="flex flex-col items-center gap-2 p-3 bg-ink border border-gold/20 rounded-lg"
            >
              <div className="flex items-center gap-2 w-full justify-between">
                <span className="text-xs font-cinzel text-parchment-light truncate max-w-[120px]">
                  {clock.name}
                </span>
                <button
                  onClick={() => onDelete(clock.id)}
                  className="text-parchment-light/30 hover:text-blood transition-colors"
                  title={t.common.delete}
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <ProgressClock
                segments={clock.segments}
                filled={clock.filled}
                onSegmentClick={(index) => handleSegmentClick(clock, index)}
              />
              <span className="text-xs text-parchment-light/40">
                {clock.filled}/{clock.segments}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
