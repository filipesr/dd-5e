"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useCharacterStore } from "@/store/characterStore";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { JsonImportButton } from "@/components/character/JsonImportButton";

export default function CharacterListPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { characters, isHydrated, createCharacter, deleteCharacter } = useCharacterStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!isHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="font-cinzel text-gold text-xl animate-pulse">{t.common.loading}</p>
      </main>
    );
  }

  const handleCreate = () => {
    const character = createCharacter({});
    router.push(`/character/${character.id}`);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteCharacter(deleteId);
      setDeleteId(null);
    }
  };

  const deleteTarget = characters.find((c) => c.id === deleteId);

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <SectionHeader title={t.character.title} className="flex-1 mb-0" />
        <div className="flex items-center gap-2 ml-6">
          <JsonImportButton />
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus size={16} />
            {t.character.newCharacter}
          </Button>
        </div>
      </div>

      {characters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="font-cinzel text-parchment-light/50 text-lg mb-2">{t.character.noCharacters}</p>
          <p className="text-parchment-light/30 text-sm mb-8">
            {t.character.noCharactersDesc}
          </p>
          <Button onClick={handleCreate} size="lg" className="flex items-center gap-2">
            <Plus size={18} />
            {t.character.createFirst}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((character) => (
            <Card
              key={character.id}
              className="p-5 cursor-pointer hover:border-gold/60 transition-colors group relative"
              onClick={() => router.push(`/character/${character.id}`)}
            >
              <button
                className="absolute top-3 right-3 text-blood/40 hover:text-blood transition-colors opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteId(character.id);
                }}
                title="Excluir personagem"
              >
                <Trash2 size={16} />
              </button>
              <h3 className="font-cinzel text-gold text-lg mb-1 pr-6 truncate">{character.name}</h3>
              <p className="text-parchment-light/60 text-sm capitalize">
                {character.race} — {character.class}
              </p>
              <p className="text-parchment-light/40 text-xs mt-1 font-cinzel">
                {t.common.level} {character.level}
              </p>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title={t.character.deleteConfirmTitle}
      >
        <p className="text-parchment-light/80 mb-6">
          {t.character.deleteConfirmText}{" "}
          <span className="text-gold font-cinzel">{deleteTarget?.name}</span>? Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>
            {t.common.cancel}
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} className="flex items-center gap-2">
            <Trash2 size={14} />
            {t.common.delete}
          </Button>
        </div>
      </Modal>
    </main>
  );
}
