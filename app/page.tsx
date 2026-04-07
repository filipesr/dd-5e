import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="font-cinzel text-5xl text-gold mb-4">D&D 5e Toolkit</h1>
      <p className="text-parchment-light/70 text-lg mb-12 text-center max-w-md">
        Ferramenta completa para jogadores e mestres de Dungeons & Dragons 5a Edição
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <Link href="/character" className="card-medieval-dark p-6 text-center hover:shadow-tome-hover transition-shadow">
          <h2 className="font-cinzel text-xl text-gold mb-2">Personagens</h2>
          <p className="text-sm text-parchment-light/60">Crie e gerencie fichas de personagem</p>
        </Link>
        <Link href="/compendium" className="card-medieval-dark p-6 text-center hover:shadow-tome-hover transition-shadow">
          <h2 className="font-cinzel text-xl text-gold mb-2">Compêndio</h2>
          <p className="text-sm text-parchment-light/60">Raças, classes, magias, monstros e itens</p>
        </Link>
        <Link href="/master" className="card-medieval-dark p-6 text-center hover:shadow-tome-hover transition-shadow">
          <h2 className="font-cinzel text-xl text-gold mb-2">Mestre</h2>
          <p className="text-sm text-parchment-light/60">Dashboard completo para o DM</p>
        </Link>
      </div>
    </main>
  );
}
