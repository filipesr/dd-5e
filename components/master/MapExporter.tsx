"use client";

import { useState, type RefObject } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface MapExporterProps {
  mapRef: RefObject<HTMLDivElement | null>;
  mapName: string;
}

export function MapExporter({ mapRef, mapName }: MapExporterProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!mapRef.current) return;

    setLoading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(mapRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const safeName = mapName.replace(/[^a-z0-9\-_]/gi, "_").toLowerCase();
        a.href = url;
        a.download = `${safeName}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (error) {
      console.error("Erro ao exportar mapa:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleExport}
      disabled={loading}
    >
      <Download size={14} className="mr-1" />
      {loading ? "Gerando..." : "Exportar como PNG"}
    </Button>
  );
}
