"use client";

import { Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EncounterTracker } from "@/components/master/EncounterTracker";
import { useCampaignStore } from "@/store/campaignStore";
import type { Encounter } from "@/types/dnd5e";

function EncounterTrackerInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const encounterId = params.id as string;
  const campaignId = searchParams.get("campaign") ?? "";

  const { getCampaign, updateEncounter } = useCampaignStore();
  const campaign = getCampaign(campaignId);
  const encounter = campaign?.encounters.find((e) => e.id === encounterId);

  if (!campaign || !encounter) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-parchment-light/50">Encontro não encontrado.</p>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">
          <ArrowLeft size={16} className="mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<Encounter>) => {
    updateEncounter(campaignId, encounterId, updates);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={16} className="mr-1" /> Voltar
        </Button>
        <h1 className="font-cinzel text-gold text-xl">{encounter.name}</h1>
      </div>
      <EncounterTracker encounter={encounter} onUpdate={handleUpdate} />
    </div>
  );
}

export default function EncounterTrackerPage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto px-4 py-8 text-parchment-light/50">Carregando...</div>}>
      <EncounterTrackerInner />
    </Suspense>
  );
}
