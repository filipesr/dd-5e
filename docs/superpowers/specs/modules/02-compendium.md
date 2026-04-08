# Spec: Modulo 2 — Compendio

**Status:** ✅ Implementado (T6, T12, T15)

---

## Rotas

- `GET /compendium` — Hub com cards para cada categoria
- `GET /compendium/[category]` — Lista com filtros e busca
- `GET /compendium/[category]/[slug]` — Pagina de detalhe

## Categorias e Fonte de Dados

| Categoria | Fonte | Rendering |
|-----------|-------|-----------|
| Racas (races) | JSON estatico | SSG (`generateStaticParams`) |
| Classes (classes) | JSON estatico | SSG |
| Condicoes (conditions) | JSON estatico | SSG |
| Regras (rules) | JSON estatico | SSG |
| Magias (spells) | Open5e API | Server Component + ISR 24h |
| Monstros (monsters) | Open5e API | Server Component + ISR 24h |
| Itens (items) | Open5e API | Server Component + ISR 24h |

## Open5e API Integration (lib/open5e.ts)

```
Endpoints:
  GET https://api.open5e.com/v1/spells/?format=json&limit=50
  GET https://api.open5e.com/v1/monsters/?format=json&limit=50
  GET https://api.open5e.com/v1/magicitems/?format=json&limit=50

Cache: fetch(url, { next: { revalidate: 86400 } })  // 24h
Paginacao: auto-follow do campo `next`
Fallback: mensagem amigavel se API indisponivel
```

## UI do Compendio

**Hub (`/compendium`):**
- Grid de 7 cards tematicos com icone (lucide-react), nome, descricao curta

**Lista (`/compendium/[category]`):**
- SearchBar com debounce 300ms
- Grid de CompendiumCard (fundo parchment, nome, subtitulo, descricao truncada)
- Filtro client-side sobre dados ja carregados

**Detalhe (`/compendium/[category]/[slug]`):**
- Card variant="parchment" com layout de pagina de livro
- Conteudo especifico por categoria (ver abaixo)
- Back link para a lista

### Campos por categoria no detalhe

| Categoria | Campos exibidos |
|-----------|----------------|
| Racas | descricao, speed, darkvision, idiomas, abilityBonuses, traits |
| Classes | hitDie, savingThrows, proficiencias, features por nivel |
| Condicoes | descricao completa |
| Regras | content (whitespace-pre-wrap) |
| Magias | nivel, escola, tempo, alcance, componentes, duracao, concentracao, classes, desc, higher_level |
| Monstros | tipo, tamanho, CR, HP, AC, 6 atributos, acoes |
| Itens | tipo, raridade, attunement, desc |

## Componentes (components/compendium/)

| Componente | Descricao |
|------------|-----------|
| SearchBar | Input debounced (300ms), icone lupa, botao limpar |
| FilterPanel | Grupos de filtros com Badge toggle multi-select |
| CompendiumCard | Card parchment com nome, subtitulo, descricao, icone opcional |
| CategoryHub | Grid de 7 categorias com icones e links |

## Pendencias (Fase 2)

- Filtros avancados por escola de magia, CR, raridade, tipo (FilterPanel existe mas nao esta conectado nas paginas)
- Botao "Adicionar a ficha" no detalhe de magias/itens
- Contagem de entradas no hub
