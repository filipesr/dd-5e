"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { PIN_TYPES } from "@/types/dnd5e";
import type { MapPin, PinType } from "@/types/dnd5e";

const PIN_TYPE_LABELS: Record<PinType, string> = {
  city: "Cidade",
  dungeon: "Masmorra",
  encounter: "Encontro",
  treasure: "Tesouro",
  npc: "NPC",
  poi: "Ponto de Interesse",
};

const PIN_TYPE_OPTIONS = PIN_TYPES.map((t) => ({
  value: t,
  label: PIN_TYPE_LABELS[t],
}));

interface PinEditorProps {
  isOpen: boolean;
  onClose: () => void;
  pin: MapPin | null;
  position: { x: number; y: number } | null;
  onSave: (data: Omit<MapPin, "id">) => void;
  onDelete: (pinId: string) => void;
}

export function PinEditor({ isOpen, onClose, pin, position, onSave, onDelete }: PinEditorProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<PinType>("poi");
  const [description, setDescription] = useState("");
  const [revealed, setRevealed] = useState(true);

  // Sync form when pin or modal changes
  useEffect(() => {
    if (pin) {
      setName(pin.name);
      setType(pin.type);
      setDescription(pin.description);
      setRevealed(pin.revealed);
    } else {
      setName("");
      setType("poi");
      setDescription("");
      setRevealed(true);
    }
  }, [pin, isOpen]);

  const handleSave = () => {
    if (!name.trim()) return;

    const x = pin ? pin.x : position?.x ?? 50;
    const y = pin ? pin.y : position?.y ?? 50;

    onSave({
      x,
      y,
      type,
      name: name.trim(),
      description: description.trim(),
      revealed,
    });
    onClose();
  };

  const handleDelete = () => {
    if (pin) {
      onDelete(pin.id);
      onClose();
    }
  };

  const isEditing = !!pin;
  const title = isEditing ? "Editar Pino" : "Novo Pino";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <Input
          label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Aldeia de Phandalin, Caverna do Dragão..."
          autoFocus
        />

        <Select
          label="Tipo"
          options={PIN_TYPE_OPTIONS}
          value={type}
          onChange={(e) => setType(e.target.value as PinType)}
        />

        <Textarea
          label="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalhes sobre este local..."
          rows={3}
        />

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={revealed}
            onChange={(e) => setRevealed(e.target.checked)}
            className="w-4 h-4 accent-gold cursor-pointer"
          />
          <span className="text-sm text-parchment-light/70 font-cinzel group-hover:text-parchment-light transition-colors">
            Revelado para jogadores
          </span>
        </label>

        {position && !isEditing && (
          <p className="text-xs text-parchment-light/30 font-mono">
            Posição: {position.x.toFixed(1)}%, {position.y.toFixed(1)}%
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gold/20">
          {isEditing ? (
            <Button variant="danger" size="sm" onClick={handleDelete}>
              <Trash2 size={14} className="mr-1" /> Excluir
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              {isEditing ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
