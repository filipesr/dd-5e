"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Users, ScrollText } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Campaign } from "@/types/dnd5e";

interface CampaignCardProps { campaign: Campaign; }

export function CampaignCard({ campaign }: CampaignCardProps) {
  const { locale } = useI18n();
  return (
    <Link href={`/${locale}/master/campaign/${campaign.id}`}>
      <Card className="p-4 hover:shadow-tome-hover transition-shadow cursor-pointer">
        <h3 className="font-cinzel text-gold text-lg mb-1">{campaign.name}</h3>
        {campaign.world && <p className="text-xs text-parchment-light/40 mb-2">{campaign.world}</p>}
        <p className="text-sm text-parchment-light/60 line-clamp-2 mb-3">{campaign.description}</p>
        <div className="flex items-center gap-4 text-xs text-parchment-light/40">
          <span className="flex items-center gap-1"><Users size={12} /> {campaign.playerCharacterIds.length} PJs</span>
          <span className="flex items-center gap-1"><ScrollText size={12} /> {campaign.sessions.length}</span>
        </div>
      </Card>
    </Link>
  );
}
