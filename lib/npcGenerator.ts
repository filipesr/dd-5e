const NAMES = [
  "Aldric", "Brenna", "Caelum", "Daria", "Elric", "Fiora", "Gareth", "Helena",
  "Ivor", "Jasmine", "Kellan", "Luna", "Magnus", "Nadia", "Orion", "Petra",
  "Quinn", "Rosalind", "Soren", "Thalia", "Ulric", "Valentina", "Wulfric", "Xena",
  "Yorick", "Zara", "Alaric", "Beatrix", "Cedric", "Dahlia", "Erasmus", "Freya",
  "Godric", "Hilda", "Isolde", "Jareth", "Katarina", "Lysander", "Morgana", "Nero",
  "Ophelia", "Percival", "Rowena", "Sigurd", "Theodora", "Valen", "Wren", "Yvaine",
];

const PROFESSIONS = [
  "Ferreiro", "Taberneiro", "Mercador", "Guarda da Cidade", "Sacerdote",
  "Alquimista", "Bibliotecario", "Cacador", "Carpinteiro", "Curandeiro",
  "Escriba", "Fazendeiro", "Joalheiro", "Mensageiro", "Minerador",
  "Navegador", "Oleiro", "Padeiro", "Relojoeiro", "Sapateiro",
  "Tatuador", "Tecelao", "Trovador", "Vigario", "Artesao",
  "Contrabandista", "Estalajadeiro", "Herbalista", "Monge", "Pescador",
];

const MOTIVATIONS = [
  "Busca vinganca contra quem destruiu sua familia",
  "Quer acumular riqueza para comprar a liberdade de alguem",
  "Protege um segredo que pode mudar o reino",
  "Procura um artefato perdido de seus ancestrais",
  "Tenta expiar um pecado terrivel do passado",
  "Deseja provar seu valor para uma organizacao",
  "Foge de uma divida impagavel com uma entidade poderosa",
  "Busca uma cura para uma doenca rara",
  "Quer reconstruir algo que foi destruido",
  "Investiga desaparecimentos misteriosos na regiao",
  "Planeja derrubar um tirano local",
  "Coleta informacoes para um patrono misterioso",
  "Busca um lar seguro para sua comunidade",
  "Tenta completar a obra inacabada de um mentor falecido",
  "Quer provar que uma lenda local e verdadeira",
];

const SECRETS = [
  "Na verdade e um espiao de uma nacao rival",
  "Tem um pacto secreto com uma entidade do plano inferior",
  "Esconde sua verdadeira identidade — e alguem famoso/procurado",
  "Possui um item magico roubado que nao sabe usar",
  "Ja matou alguem e encobriu como acidente",
  "E membro secreto de uma guilda de assassinos",
  "Ouve vozes de uma entidade que ninguem mais percebe",
  "Tem uma divida de vida com um vampiro",
  "Sabe a localizacao de um tesouro mas tem medo de ir buscar",
  "E amaldicoado — transforma-se em algo sob certas condicoes",
  "Traiu o grupo anterior de aventureiros",
  "Esconde um filho/filha que ninguem sabe que existe",
  "Fez um juramento inquebravel que conflita com seus desejos",
  "Possui visoes profeticas que nao consegue controlar",
  "E na verdade uma criatura transformada (changeling, etc.)",
];

const TRAITS = [
  "Fala em rimas quando nervoso",
  "Sempre carrega um amuleto e o toca antes de tomar decisoes",
  "Ri em momentos inapropriados",
  "Tem um tique de piscar excessivamente",
  "Coleciona objetos aparentemente sem valor",
  "Desconfia de qualquer um com chapeu",
  "Conta historias longas e tangenciais",
  "Sempre tenta barganhar, mesmo quando nao ha necessidade",
  "Sussurra em vez de falar normalmente",
  "Tem medo irracional de passaros",
  "Sempre come quando esta pensando",
  "Refere-se a si mesmo na terceira pessoa",
  "Desenha no chao enquanto conversa",
  "Tem uma risada contagiante e escandalosa",
  "Nunca faz contato visual direto",
  "Excessivamente educado, mesmo com inimigos",
  "Sempre tem uma citacao ou proverbio pronto",
  "Assobia melodias sem perceber",
  "Gesticula exageradamente ao falar",
  "Coleciona rumores e fofocas obsessivamente",
];

const RACES_PT = [
  "Humano", "Elfo", "Anao", "Halfling", "Gnomo",
  "Meio-Elfo", "Meio-Orc", "Tiefling", "Dragonborn",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export interface GeneratedNPC {
  name: string;
  race: string;
  profession: string;
  motivation: string;
  secret: string;
  trait: string;
}

export function generateQuickNPC(): GeneratedNPC {
  return {
    name: pickRandom(NAMES),
    race: pickRandom(RACES_PT),
    profession: pickRandom(PROFESSIONS),
    motivation: pickRandom(MOTIVATIONS),
    secret: pickRandom(SECRETS),
    trait: pickRandom(TRAITS),
  };
}
