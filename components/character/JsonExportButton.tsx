"use client";

import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import type { Character } from "@/types/dnd5e";

interface Props {
  character: Character;
}

export function JsonExportButton({ character }: Props) {
  const handleExport = async () => {
    const { exportCharacterToJSON } = await import("@/lib/jsonImportExport");
    const blob = exportCharacterToJSON(character);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${character.name.replace(/\s+/g, "_")}_ficha.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button onClick={handleExport} variant="ghost" size="sm">
      <Download size={14} className="mr-1" /> JSON
    </Button>
  );
}
