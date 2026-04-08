import Link from "next/link";
import { Users, Swords, Sparkles, Skull, Shield, AlertTriangle, BookOpen } from "lucide-react";

const CATEGORIES = [
  { slug: "races", name: "Raças", icon: Users, description: "9 raças jogáveis do SRD" },
  { slug: "classes", name: "Classes", icon: Swords, description: "12 classes com progressão completa" },
  { slug: "spells", name: "Magias", icon: Sparkles, description: "Magias de todas as classes e níveis" },
  { slug: "monsters", name: "Monstros", icon: Skull, description: "Criaturas por tipo, tamanho e CR" },
  { slug: "items", name: "Itens Mágicos", icon: Shield, description: "Itens por raridade e tipo" },
  { slug: "conditions", name: "Condições", icon: AlertTriangle, description: "12 condições de jogo" },
  { slug: "rules", name: "Regras Rápidas", icon: BookOpen, description: "Referência rápida de combate e exploração" },
];

export function CategoryHub() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {CATEGORIES.map((cat) => (
        <Link key={cat.slug} href={`/compendium/${cat.slug}`} className="card-medieval-dark p-5 hover:shadow-tome-hover transition-all group">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gold/10 rounded group-hover:bg-gold/20 transition-colors">
              <cat.icon size={24} className="text-gold" />
            </div>
            <h3 className="font-cinzel text-gold text-lg">{cat.name}</h3>
          </div>
          <p className="text-sm text-parchment-light/50">{cat.description}</p>
        </Link>
      ))}
    </div>
  );
}
