"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import { Upload } from "lucide-react";
import { useCharacterStore } from "@/store/characterStore";

export function JsonImportButton() {
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { createCharacter } = useCharacterStore();
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { importCharacterFromJSON } = await import("@/lib/jsonImportExport");
      const character = await importCharacterFromJSON(file);
      const created = createCharacter(character);
      router.push(`/character/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.character.actions.importError);
      setTimeout(() => setError(null), 3000);
    }
    // Reset input
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="relative">
      <Button onClick={() => fileRef.current?.click()} variant="ghost" size="sm">
        <Upload size={14} className="mr-1" /> {t.character.actions.importJson}
      </Button>
      <input ref={fileRef} type="file" accept=".json" onChange={handleFile} className="hidden" />
      {error && (
        <p className="absolute top-full left-0 mt-1 text-xs text-blood bg-ink-light border border-blood/30 rounded px-2 py-1 whitespace-nowrap z-50">
          {error}
        </p>
      )}
    </div>
  );
}
