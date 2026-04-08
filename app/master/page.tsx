"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { CampaignCard } from "@/components/master/CampaignCard";
import { useCampaignStore } from "@/store/campaignStore";

export default function MasterPage() {
  const { campaigns, createCampaign } = useCampaignStore();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [world, setWorld] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    createCampaign({ name: name.trim(), world: world.trim(), description: description.trim() });
    setName("");
    setWorld("");
    setDescription("");
    setShowModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="Área do Mestre" className="flex-1" />
        <Button onClick={() => setShowModal(true)} className="ml-4 whitespace-nowrap">
          Nova Campanha
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-parchment-light/40">
          <p className="font-cinzel text-lg mb-2">Nenhuma campanha ainda</p>
          <p className="text-sm">Crie sua primeira campanha para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nova Campanha">
        <div className="space-y-4">
          <Input
            label="Nome da Campanha"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: A Maldição de Strahd"
          />
          <Input
            label="Mundo / Cenário"
            value={world}
            onChange={(e) => setWorld(e.target.value)}
            placeholder="Ex: Barovia, Forgotten Realms"
          />
          <Textarea
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Uma breve descrição da campanha..."
            rows={3}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim()}>
              Criar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
