"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { CampaignCard } from "@/components/master/CampaignCard";
import { useCampaignStore } from "@/store/campaignStore";
import { useI18n } from "@/lib/i18n";

export default function MasterPage() {
  const { t } = useI18n();
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
        <SectionHeader title={t.master.title} className="flex-1" />
        <Button onClick={() => setShowModal(true)} className="ml-4 whitespace-nowrap">
          {t.master.newCampaign}
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-parchment-light/40">
          <p className="font-cinzel text-lg mb-2">{t.master.noCampaigns}</p>
          <p className="text-sm">{t.master.noCampaignsDesc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={t.master.newCampaign}>
        <div className="space-y-4">
          <Input
            label={t.master.campaignName}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: A Maldição de Strahd"
          />
          <Input
            label={t.master.world}
            value={world}
            onChange={(e) => setWorld(e.target.value)}
            placeholder="Ex: Barovia, Forgotten Realms"
          />
          <Textarea
            label={t.common.description}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Uma breve descrição da campanha..."
            rows={3}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim()}>
              {t.common.create}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
