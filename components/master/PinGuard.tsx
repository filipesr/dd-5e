"use client";

import { useState, useEffect } from "react";
import { useCampaignStore } from "@/store/campaignStore";
import { Button } from "@/components/ui/Button";
import { Lock } from "lucide-react";

export function PinGuard({ children }: { children: React.ReactNode }) {
  const { isPinSet, setPin, verifyPin, isHydrated } = useCampaignStore();
  const [input, setInput] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isHydrated && !isPinSet()) setIsCreating(true);
  }, [isHydrated, isPinSet]);

  if (!isHydrated) {
    return <div className="flex items-center justify-center h-64 text-parchment-light/50">Carregando...</div>;
  }

  if (confirmed) return <>{children}</>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.length < 4) { setError("PIN deve ter pelo menos 4 dígitos"); return; }
    if (isCreating) {
      await setPin(input);
      setConfirmed(true);
    } else {
      const valid = await verifyPin(input);
      if (valid) { setConfirmed(true); } else { setError("PIN incorreto"); setInput(""); }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <Lock size={48} className="text-gold/60" />
      <h2 className="font-cinzel text-2xl text-gold">{isCreating ? "Criar PIN do Mestre" : "Área do Mestre"}</h2>
      <p className="text-parchment-light/50 text-center max-w-sm">
        {isCreating ? "Crie um PIN de 4-6 dígitos para proteger sua área de mestre." : "Digite seu PIN para acessar o dashboard."}
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
        <input type="password" value={input} onChange={(e) => { setInput(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
          placeholder="PIN" className="w-40 text-center text-2xl tracking-[0.5em] bg-parchment/10 border border-gold/30 rounded py-2 text-parchment-light focus:outline-none focus:border-gold" autoFocus />
        {error && <p className="text-blood text-sm">{error}</p>}
        <Button type="submit">{isCreating ? "Criar PIN" : "Entrar"}</Button>
      </form>
    </div>
  );
}
