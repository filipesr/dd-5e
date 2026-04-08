"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface MapUploaderProps {
  onAdd: (name: string, imageBase64: string) => void;
  onCancel?: () => void;
}

export function MapUploader({ onAdd, onCancel }: MapUploaderProps) {
  const [mapName, setMapName] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [fileSizeMB, setFileSizeMB] = useState(0);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileSizeMB(file.size / (1024 * 1024));
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageBase64(e.target?.result as string);
      setLoading(false);
    };
    reader.readAsDataURL(file);

    // Auto-fill name from filename if not set
    if (!mapName) {
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setMapName(baseName);
    }
  }, [mapName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    multiple: false,
  });

  const handleAdd = () => {
    if (!mapName.trim() || !imageBase64) return;
    onAdd(mapName.trim(), imageBase64);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-gold bg-gold/10"
            : "border-gold/40 hover:border-gold/70 hover:bg-parchment/5"
        }`}
      >
        <input {...getInputProps()} />
        {loading ? (
          <p className="text-parchment-light/60 text-sm">Carregando imagem...</p>
        ) : imageBase64 ? (
          <div className="space-y-2">
            <img
              src={imageBase64}
              alt="Preview do mapa"
              className="max-h-48 mx-auto rounded object-contain"
            />
            <p className="text-xs text-parchment-light/40">
              Clique ou arraste para trocar a imagem
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="mx-auto text-gold/60" size={40} />
            <div>
              <p className="text-parchment-light/70 text-sm font-cinzel">
                {isDragActive ? "Solte a imagem aqui" : "Arraste um mapa ou clique para selecionar"}
              </p>
              <p className="text-parchment-light/40 text-xs mt-1">PNG, JPG, WebP</p>
            </div>
          </div>
        )}
      </div>

      {fileSizeMB > 2 && (
        <div className="flex items-center gap-2 text-yellow-400 text-xs bg-yellow-400/10 border border-yellow-400/30 rounded px-3 py-2">
          <AlertTriangle size={14} />
          <span>Imagem grande pode impactar performance ({fileSizeMB.toFixed(1)}MB)</span>
        </div>
      )}

      <Input
        label="Nome do Mapa"
        value={mapName}
        onChange={(e) => setMapName(e.target.value)}
        placeholder="Ex: Mapa do Continente, Masmorra do Anel..."
      />

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button
          onClick={handleAdd}
          disabled={!mapName.trim() || !imageBase64}
        >
          Adicionar Mapa
        </Button>
      </div>
    </div>
  );
}
