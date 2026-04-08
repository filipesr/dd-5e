"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FileDown, Loader2 } from "lucide-react";
import type { Character } from "@/types/dnd5e";

interface PdfExportButtonProps {
  character: Character;
}

export function PdfExportButton({ character }: PdfExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      // Lazy import to avoid 1.5MB in main bundle
      const { generateCharacterPdf } = await import("@/lib/pdfExport");
      const blob = await generateCharacterPdf(character);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${character.name.replace(/\s+/g, "_")}_ficha.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant="secondary"
      size="sm"
      disabled={loading}
    >
      {loading ? (
        <><Loader2 size={14} className="mr-1 animate-spin" /> Exportando...</>
      ) : (
        <><FileDown size={14} className="mr-1" /> Exportar PDF</>
      )}
    </Button>
  );
}
