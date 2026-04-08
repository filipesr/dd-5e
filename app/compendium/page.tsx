import { SectionHeader } from "@/components/ui/SectionHeader";
import { CategoryHub } from "@/components/compendium/CategoryHub";

export default function CompendiumPage() {
  return (
    <div>
      <SectionHeader title="Compêndio" />
      <p className="text-parchment-light/50 text-center mb-8">
        Consulte raças, classes, magias, monstros, itens e regras do D&amp;D 5e
      </p>
      <CategoryHub />
    </div>
  );
}
