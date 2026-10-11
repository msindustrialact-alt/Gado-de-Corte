# Calendário de Vacinas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o módulo `/sanidade/vacinas` com protocolo, aplicação por lote, status Em dia/Incompleto/Atrasado (por data de realização) e integração no dashboard.

**Architecture:** Catálogo + protocolo + sessões/aplicações no Postgres (RLS `minhas_fazendas`); status **calculado** em funções puras (`src/lib/vacinas.ts`) a partir das realizações; UI Next.js App Router no padrão de pesagens; Joana/Cataguá já compartilham o mesmo `fazenda_id` (propriedade no animal), então o MVP usa um protocolo ativo por fazenda.

**Tech Stack:** Next.js 16 App Router, Supabase (Postgres + RLS), Zod, React Hook Form, TypeScript, Vitest (só domínio puro — o repo ainda não tinha runner de testes).

**Spec:** `docs/superpowers/specs/2026-10-11-vacinas-calendario-design.md`

## Global Constraints

- Datas civis via `public.hoje_fazenda()` / `hojeISO()` — fuso `America/Sao_Paulo`; data de realização ≤ hoje.
- Soft delete: `deleted_at`; listagens ignoram deletados.
- RLS: `fazenda_id IN (SELECT public.minhas_fazendas())` em todas as tabelas novas.
- Status nunca vem do client como verdade — sempre recalcular no server.
- MVP: só Vacinas (não vermífugos/tratamentos); sem baixa de estoque automática.
- Rotas reais em `src/app/(app)/sanidade/vacinas/**` (o catch-all `[...modulo]` só serve o que não tiver página própria).
- Commits frequentes em português, no estilo do repo (`Adiciona…`, `Corrige…`).
- `protocolos_vacina.fazenda_id` permanece **nullable** no schema (futuro); no MVP a app **sempre grava** o `fazenda_id` ativo.

## Review Focus

1. Animal **sem `data_nascimento`** + item de protocolo com `idade_minima_dias` → não marcar Em dia; status/aviso de indefinido — coberto na Task 2.
2. Animal **novo no lote depois** da sessão → continua Incompleto — coberto na Task 2 + verificação manual Task 5.
3. Animal **desmarcado** na sessão → zero linhas em `vacinacao_aplicacoes` para ele — coberto na Task 5.
4. Vacina com `intervalo_dias` e última dose antiga → **Atrasado** (não Incompleto) — coberto na Task 2.
5. Sem protocolo ativo → hub não quebra; orienta cadastrar protocolo — coberto na Task 6.

## File map

| Path | Responsabilidade |
|------|------------------|
| `supabase/migrations/20261011200000_vacinas_calendario.sql` | Tabelas, índices, RLS |
| `src/types/database.ts` | Tipos gerados/atualizados |
| `src/lib/vacinas.ts` | Tipos de domínio, labels, `avaliarStatusAnimal`, agregação lote |
| `src/lib/vacinas/data.ts` | Queries/mutations Supabase |
| `src/lib/vacinas/schema.ts` | Zod |
| `src/lib/vacinas/status.test.ts` | Testes Vitest das regras |
| `src/app/(app)/sanidade/vacinas/page.tsx` | Hub |
| `src/app/(app)/sanidade/vacinas/aplicar/page.tsx` | Aplicar no lote |
| `src/app/(app)/sanidade/vacinas/protocolo/page.tsx` | Protocolo |
| `src/app/(app)/sanidade/vacinas/actions.ts` | Server actions |
| `src/components/vacinas/*` | UI |
| `src/components/animais/animal-detalhe.tsx` | Bloco Vacinas |
| `src/lib/dashboard/data.ts` | Próximos manejos + ocorrências |
| `vitest.config.ts` + `package.json` | Runner de testes |

---

### Task 1: Migration + RLS

**Files:**
- Create: `supabase/migrations/20261011200000_vacinas_calendario.sql`
- Modify: `src/types/database.ts` (após apply — via `generate_typescript_types` MCP ou patch manual alinhado às tabelas)

**Interfaces:**
- Consumes: `public.minhas_fazendas()`, `public.hoje_fazenda()`, FKs `fazendas`, `lotes`, `animais`
- Produces: tabelas `vacinas`, `protocolos_vacina`, `protocolo_vacinas`, `vacinacao_sessoes`, `vacinacao_aplicacoes`

- [ ] **Step 1: Escrever a migration**

Criar arquivo com (conteúdo completo no commit):

```sql
-- Calendário de vacinas (MVP)
-- Depende de: fazendas, lotes, animais, minhas_fazendas(), hoje_fazenda()

CREATE TABLE public.vacinas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fazenda_id uuid NOT NULL REFERENCES public.fazendas (id),
  nome text NOT NULL,
  intervalo_dias integer NULL CHECK (intervalo_dias IS NULL OR intervalo_dias > 0),
  ativa boolean NOT NULL DEFAULT true,
  observacoes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT vacinas_nome_fazenda_unique UNIQUE (fazenda_id, nome)
);

CREATE TABLE public.protocolos_vacina (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fazenda_id uuid NULL REFERENCES public.fazendas (id),
  nome text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  vigencia_inicio date NULL,
  vigencia_fim date NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE UNIQUE INDEX protocolos_vacina_um_ativo_por_fazenda
  ON public.protocolos_vacina (fazenda_id)
  WHERE ativo = true AND deleted_at IS NULL AND fazenda_id IS NOT NULL;

CREATE TABLE public.protocolo_vacinas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo_id uuid NOT NULL REFERENCES public.protocolos_vacina (id),
  vacina_id uuid NOT NULL REFERENCES public.vacinas (id),
  obrigatoria boolean NOT NULL DEFAULT true,
  idade_minima_dias integer NULL CHECK (idade_minima_dias IS NULL OR idade_minima_dias >= 0),
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT protocolo_vacinas_unique UNIQUE (protocolo_id, vacina_id)
);

CREATE TABLE public.vacinacao_sessoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fazenda_id uuid NOT NULL REFERENCES public.fazendas (id),
  lote_id uuid NOT NULL REFERENCES public.lotes (id),
  data date NOT NULL DEFAULT public.hoje_fazenda(),
  qtd_animais_lote integer NULL,
  qtd_aplicados integer NULL,
  observacoes text NULL,
  created_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT vacinacao_sessoes_data_passado CHECK (data <= public.hoje_fazenda())
);

CREATE TABLE public.vacinacao_aplicacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fazenda_id uuid NOT NULL REFERENCES public.fazendas (id),
  sessao_id uuid NULL REFERENCES public.vacinacao_sessoes (id),
  animal_id uuid NOT NULL REFERENCES public.animais (id),
  vacina_id uuid NOT NULL REFERENCES public.vacinas (id),
  lote_id uuid NULL REFERENCES public.lotes (id),
  data date NOT NULL DEFAULT public.hoje_fazenda(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT vacinacao_aplicacoes_data_passado CHECK (data <= public.hoje_fazenda())
);

CREATE UNIQUE INDEX vacinacao_aplicacoes_animal_vacina_data
  ON public.vacinacao_aplicacoes (animal_id, vacina_id, data)
  WHERE deleted_at IS NULL;

CREATE INDEX vacinacao_aplicacoes_fazenda_animal
  ON public.vacinacao_aplicacoes (fazenda_id, animal_id)
  WHERE deleted_at IS NULL;

CREATE INDEX vacinacao_aplicacoes_fazenda_data
  ON public.vacinacao_aplicacoes (fazenda_id, data DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX vacinacao_sessoes_fazenda_data
  ON public.vacinacao_sessoes (fazenda_id, data DESC)
  WHERE deleted_at IS NULL;

-- RLS (repetir padrão para as 5 tabelas)
ALTER TABLE public.vacinas ENABLE ROW LEVEL SECURITY;
-- ... policies SELECT/INSERT/UPDATE com fazenda_id IN (SELECT public.minhas_fazendas())

ALTER TABLE public.protocolos_vacina ENABLE ROW LEVEL SECURITY;
-- SELECT: fazenda_id IN (minhas_fazendas()) OR fazenda_id IS NULL
-- INSERT/UPDATE MVP: fazenda_id IN (minhas_fazendas())
```

Completar policies UPDATE com `USING` + `WITH CHECK` iguais às de `produtos` em `20260923200000_estoque_lancamentos_cotacoes.sql`.

- [ ] **Step 2: Aplicar migration no projeto Supabase**

Via MCP `apply_migration` (nome `vacinas_calendario`) ou CLI `supabase db push`. Confirmar tabelas com `list_tables`.

- [ ] **Step 3: Atualizar `src/types/database.ts`**

Incluir as 5 tabelas em `Database["public"]["Tables"]` (generate types ou patch manual consistente).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20261011200000_vacinas_calendario.sql src/types/database.ts
git commit -m "Adiciona tabelas e RLS do calendario de vacinas."
```

---

### Task 2: Domínio puro + Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/vacinas.ts`
- Create: `src/lib/vacinas/status.test.ts`
- Modify: `package.json` (scripts `test`, deps `vitest`)

**Interfaces:**
- Consumes: nada de Supabase (funções puras)
- Produces:

```ts
export type StatusVacinaAnimal = "em_dia" | "incompleto" | "atrasado" | "sem_protocolo" | "indefinido";

export type ItemProtocoloVacina = {
  vacina_id: string;
  vacina_nome: string;
  obrigatoria: boolean;
  idade_minima_dias: number | null;
  intervalo_dias: number | null;
};

export type RealizacaoVacina = {
  vacina_id: string;
  data: string; // YYYY-MM-DD
};

export type VacinaFaltante = {
  vacina_id: string;
  vacina_nome: string;
  motivo: "nunca" | "intervalo_vencido" | "sem_nascimento";
  ultima_data: string | null;
  proxima_prevista: string | null;
};

export type AvaliacaoVacinaAnimal = {
  status: StatusVacinaAnimal;
  faltantes: VacinaFaltante[];
};

export function diasEntre(isoInicio: string, isoFim: string): number;
export function adicionarDias(iso: string, dias: number): string;
export function avaliarStatusAnimal(params: {
  hoje: string;
  dataNascimento: string | null;
  itensProtocolo: ItemProtocoloVacina[];
  realizacoes: RealizacaoVacina[]; // todas do animal; a função pega a última por vacina
}): AvaliacaoVacinaAnimal;

export function agregarStatusLote(
  statusAnimais: StatusVacinaAnimal[],
): "em_dia" | "pendente" | "vazio";
```

- [ ] **Step 1: Instalar Vitest**

```bash
npm install -D vitest
```

`package.json`:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

`vitest.config.ts`:

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node" },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

- [ ] **Step 2: Escrever testes que falham**

Em `src/lib/vacinas/status.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { avaliarStatusAnimal } from "@/lib/vacinas";

const protocolo2 = [
  {
    vacina_id: "v1",
    vacina_nome: "Aftosa",
    obrigatoria: true,
    idade_minima_dias: null,
    intervalo_dias: null,
  },
  {
    vacina_id: "v2",
    vacina_nome: "Raiva",
    obrigatoria: true,
    idade_minima_dias: null,
    intervalo_dias: null,
  },
];

describe("avaliarStatusAnimal", () => {
  it("sem realizacoes → incompleto com 2 faltantes", () => {
    const r = avaliarStatusAnimal({
      hoje: "2026-10-11",
      dataNascimento: "2024-01-01",
      itensProtocolo: protocolo2,
      realizacoes: [],
    });
    expect(r.status).toBe("incompleto");
    expect(r.faltantes).toHaveLength(2);
  });

  it("1 de 2 aplicadas → incompleto com 1 faltante", () => {
    const r = avaliarStatusAnimal({
      hoje: "2026-10-11",
      dataNascimento: "2024-01-01",
      itensProtocolo: protocolo2,
      realizacoes: [{ vacina_id: "v1", data: "2026-09-01" }],
    });
    expect(r.status).toBe("incompleto");
    expect(r.faltantes.map((f) => f.vacina_id)).toEqual(["v2"]);
  });

  it("ambas sem intervalo → em_dia", () => {
    const r = avaliarStatusAnimal({
      hoje: "2026-10-11",
      dataNascimento: "2024-01-01",
      itensProtocolo: protocolo2,
      realizacoes: [
        { vacina_id: "v1", data: "2026-09-01" },
        { vacina_id: "v2", data: "2026-09-01" },
      ],
    });
    expect(r.status).toBe("em_dia");
    expect(r.faltantes).toHaveLength(0);
  });

  it("intervalo vencido → atrasado", () => {
    const r = avaliarStatusAnimal({
      hoje: "2026-10-11",
      dataNascimento: "2024-01-01",
      itensProtocolo: [
        {
          vacina_id: "v1",
          vacina_nome: "Aftosa",
          obrigatoria: true,
          idade_minima_dias: null,
          intervalo_dias: 180,
        },
      ],
      realizacoes: [{ vacina_id: "v1", data: "2026-01-01" }], // 283 dias
    });
    expect(r.status).toBe("atrasado");
    expect(r.faltantes[0]?.motivo).toBe("intervalo_vencido");
  });

  it("idade minima sem nascimento → indefinido", () => {
    const r = avaliarStatusAnimal({
      hoje: "2026-10-11",
      dataNascimento: null,
      itensProtocolo: [
        {
          vacina_id: "v1",
          vacina_nome: "Brucelose",
          obrigatoria: true,
          idade_minima_dias: 90,
          intervalo_dias: null,
        },
      ],
      realizacoes: [],
    });
    expect(r.status).toBe("indefinido");
  });

  it("protocolo vazio → sem_protocolo", () => {
    const r = avaliarStatusAnimal({
      hoje: "2026-10-11",
      dataNascimento: "2024-01-01",
      itensProtocolo: [],
      realizacoes: [],
    });
    expect(r.status).toBe("sem_protocolo");
  });
});
```

- [ ] **Step 3: Rodar e ver falha**

```bash
npm test
```

Expected: FAIL (módulo/`avaliarStatusAnimal` inexistente).

- [ ] **Step 4: Implementar `src/lib/vacinas.ts`**

Regras (alinhar à spec §5):

1. Se `itensProtocolo` filtrado `obrigatoria` está vazio → `sem_protocolo`.
2. Para cada item obrigatório: se `idade_minima_dias != null` e sem nascimento → acumular faltante `sem_nascimento` e marcar ramo indefinido.
3. Se idade mínima e nascimento: só devida se `diasEntre(nascimento, hoje) >= idade_minima_dias`.
4. Última realização por `vacina_id` (max data).
5. Nunca realizada e devida → faltante `nunca` → status candidato incompleto.
6. Com `intervalo_dias`: se `hoje > adicionarDias(ultima, intervalo)` → faltante `intervalo_vencido` → atrasado.
7. Agregação status: se qualquer `sem_nascimento` em devida → `indefinido`; else se qualquer `nunca` → `incompleto`; else se qualquer `intervalo_vencido` → `atrasado`; else `em_dia`.

Usar parsing de data `YYYY-MM-DD` em UTC noon ou partes locais consistentes (mesmo padrão de `mesesDeIdade` em `src/lib/animais.ts`).

- [ ] **Step 5: Rodar testes**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/vacinas.ts src/lib/vacinas/status.test.ts
git commit -m "Adiciona regras de status de vacinas com testes."
```

---

### Task 3: Schemas Zod + data layer

**Files:**
- Create: `src/lib/vacinas/schema.ts`
- Create: `src/lib/vacinas/data.ts`

**Interfaces:**
- Consumes: `createClient`, `getFazendaAtiva`, tipos Task 1, `avaliarStatusAnimal`
- Produces:

```ts
// schema.ts
export const schemaVacina: ZodType;
export const schemaProtocolo: ZodType; // nome + itens[]
export const schemaAplicarLote: ZodType; // lote_id, data, vacina_ids[], animal_ids[], observacoes

// data.ts
export async function getVacinas(): Promise<Vacina[]>;
export async function upsertVacina(...): Promise<{ ok: true } | { ok: false; message: string }>;
export async function getProtocoloAtivo(): Promise<ProtocoloComItens | null>;
export async function salvarProtocolo(...): Promise<...>;
export async function getAnimaisAtivosDoLote(loteId: string): Promise<AnimalVacinaRow[]>;
export async function criarSessaoVacinacao(input: {
  lote_id: string;
  data: string;
  vacina_ids: string[];
  animal_ids: string[];
  observacoes: string;
}): Promise<{ ok: true; id: string } | { ok: false; message: string }>;
export async function getStatusRebanho(): Promise<{
  porAnimal: Array<{ animal_id; brinco; lote_id; lote_nome; avaliacao: AvaliacaoVacinaAnimal }>;
  porLote: Array<{ lote_id; lote_nome; status; qtd_em_dia; qtd_incompleto; qtd_atrasado; qtd_indefinido }>;
  kpis: { em_dia; incompleto; atrasado; indefinido; sessoes_mes };
}>;
export async function getHistoricoAnimalVacinas(animalId: string): Promise<RealizacaoVacina[]>;
export async function getSessoesRecentes(limit?: number): Promise<SessaoResumo[]>;
export async function getLotesComVacinaPendente(): Promise<Array<{ lote_id; nome; qtd_pendentes }>>;
```

- [ ] **Step 1: Implementar `schema.ts`**

Espelhar validações de `src/lib/pesagens/schema.ts` (`hojeISO()`, data não futura, uuid de lote/vacinas/animais, arrays min 1).

- [ ] **Step 2: Implementar `data.ts`**

- `getProtocoloAtivo`: `.eq("ativo", true).eq("fazenda_id", fazenda.id).is("deleted_at", null).maybeSingle()` + join itens + vacinas.
- `criarSessaoVacinacao`: insert sessão → insert aplicações (produto cartesiano animal × vacina_ids) → update contagens; em erro, soft-delete ou abortar com message clara; checar duplicata unique.
- `getStatusRebanho`: carregar animais ativos, protocolo, todas realizações da fazenda (ou por animal em batch), mapear `avaliarStatusAnimal`.

- [ ] **Step 3: Smoke manual rápido**

Com `npm run dev` e usuário logado: chamar temporariamente via action stub ou script não é obrigatório se Task 4/5 cobrirem — ao menos garantir TypeScript: `npx tsc --noEmit` ou `npm run build` parcial.

- [ ] **Step 4: Commit**

```bash
git add src/lib/vacinas/schema.ts src/lib/vacinas/data.ts
git commit -m "Adiciona data layer e schemas de vacinas."
```

---

### Task 4: Catálogo de vacinas + Protocolo UI

**Files:**
- Create: `src/app/(app)/sanidade/vacinas/protocolo/page.tsx`
- Create: `src/app/(app)/sanidade/vacinas/actions.ts` (actions de vacina + protocolo)
- Create: `src/components/vacinas/vacinas-catalogo.tsx`
- Create: `src/components/vacinas/protocolo-form.tsx`
- Create: `src/components/vacinas/vacina-badges.tsx`

**Interfaces:**
- Consumes: `getVacinas`, `upsertVacina`, `getProtocoloAtivo`, `salvarProtocolo`
- Produces: páginas usáveis em `/sanidade/vacinas/protocolo`

- [ ] **Step 1: Server actions**

```ts
"use server";
// salvarVacinaAction, arquivarVacinaAction, salvarProtocoloAction
// revalidatePath("/sanidade/vacinas"); revalidatePath("/sanidade/vacinas/protocolo");
```

- [ ] **Step 2: UI protocolo**

- Lista/edição do protocolo ativo (nome).
- Multi-select ou linhas: vacina, obrigatória, idade mínima (dias), ordem.
- Botão criar vacina rápida (nome + intervalo opcional) no mesmo fluxo.
- Ao salvar protocolo ativo, garantir desativar outros ativos da mesma fazenda (se unique index não cobrir edge cases).

- [ ] **Step 3: Verificar no browser**

1. Abrir `/sanidade/vacinas/protocolo` (não deve cair em EmBreve).
2. Criar vacinas “Aftosa”, “Raiva”.
3. Montar protocolo ativo com as duas.
4. Recarregar: itens persistem.

- [ ] **Step 4: Commit**

```bash
git add src/app/(app)/sanidade/vacinas src/components/vacinas
git commit -m "Adiciona cadastro de vacinas e protocolo."
```

---

### Task 5: Aplicar no lote

**Files:**
- Create: `src/app/(app)/sanidade/vacinas/aplicar/page.tsx`
- Create: `src/components/vacinas/aplicar-lote-tela.tsx`
- Modify: `src/app/(app)/sanidade/vacinas/actions.ts` — `aplicarVacinaLoteAction`

**Interfaces:**
- Consumes: `getLotes` (ativos), `getAnimaisAtivosDoLote`, `getVacinas`/`getProtocoloAtivo`, `criarSessaoVacinacao`, `schemaAplicarLote`
- Produces: sessão + aplicações; redirect para hub ou detalhe da sessão

- [ ] **Step 1: Page server**

```tsx
// searchParams.lote opcional (igual pesagens/nova)
const lotes = (await getLotes()).filter((l) => l.status === "ativo");
```

- [ ] **Step 2: Client form**

- Select lote → carrega animais (server action ou pass via RSC refresh).
- Checkboxes vacinas (default: itens do protocolo ativo).
- Date input default `hojeISO()`.
- Lista animais todos checked; “Selecionar todos / limpar”.
- Submit → `aplicarVacinaLoteAction`.

Action deve:
1. Validar Zod.
2. Garantir animais pertencem ao lote e fazenda.
3. Chamar `criarSessaoVacinacao`.
4. `revalidatePath` hub, lotes, animais, dashboard.

- [ ] **Step 3: Teste manual**

1. Lote com N animais; aplicar 1 vacina em N-1 (desmarcar 1).
2. No Supabase/SQL: N-1 aplicações; o desmarcado sem linha.
3. Animal novo colocado no lote depois: sem aplicações herdadas.

- [ ] **Step 4: Commit**

```bash
git add src/app/(app)/sanidade/vacinas/aplicar src/components/vacinas/aplicar-lote-tela.tsx src/app/(app)/sanidade/vacinas/actions.ts
git commit -m "Adiciona aplicacao de vacinas por lote."
```

---

### Task 6: Hub `/sanidade/vacinas`

**Files:**
- Create: `src/app/(app)/sanidade/vacinas/page.tsx`
- Create: `src/components/vacinas/vacinas-hub.tsx`
- Create: `src/components/vacinas/vacinas-kpis.tsx`
- Create: `src/components/vacinas/vacinas-lotes-lista.tsx`

**Interfaces:**
- Consumes: `getStatusRebanho`, `getSessoesRecentes`
- Produces: substitui EmBreve na rota do menu

- [ ] **Step 1: Page**

```tsx
export const metadata = { title: "Vacinas | Fazendas Joana e Cataguá" };
// Promise.all status + sessoes + protocoloAtivo
// Se !protocolo → banner CTA para /sanidade/vacinas/protocolo
```

- [ ] **Step 2: Hub UI**

- KPIs compactos mobile (`grid-cols-2` / `lg:grid-cols-4`) reusando padrão `CardResumo`.
- Lista por lote: badge status, contagens, “o que mais falta” (top vacinas).
- Botões: Aplicar no lote, Protocolo, filtro pendentes.
- Histórico curto das últimas sessões.

Badges em `vacina-badges.tsx`: cores alinhadas a `StatusBadge` (positivo / alerta / perigo).

- [ ] **Step 3: Verificar**

1. Menu Sanidade → Vacinas abre o hub (não EmBreve).
2. Com protocolo + sessão da Task 5, KPIs ≠ zero.
3. Mobile: cards KPI 2×2.

- [ ] **Step 4: Commit**

```bash
git add src/app/(app)/sanidade/vacinas/page.tsx src/components/vacinas
git commit -m "Adiciona hub de vacinas com status do rebanho."
```

---

### Task 7: Ficha do animal

**Files:**
- Modify: `src/components/animais/animal-detalhe.tsx`
- Modify: `src/app/(app)/animais/[id]/page.tsx` — carregar avaliação + histórico
- Modify: `src/lib/vacinas/data.ts` se precisar `getAvaliacaoAnimal(id)`

**Interfaces:**
- Consumes: `getHistoricoAnimalVacinas`, `avaliarStatusAnimal` / helper data
- Produces: seção Vacinas no detalhe

- [ ] **Step 1: Carregar dados na page**

```ts
const avaliacao = await getAvaliacaoAnimal(id);
const historicoVacinas = await getHistoricoAnimalVacinas(id);
```

Passar como props para `AnimalDetalhe`.

- [ ] **Step 2: Bloco UI**

Após geneologia/desempenho (posição legível):

- Badge de status
- Lista “O que falta” (nomes + motivo)
- Tabela/lista simples do histórico (data, vacina)
- Link `Aplicar no lote` se `animal.lote` → `/sanidade/vacinas/aplicar?lote=`

- [ ] **Step 3: Verificar**

Abrir animal incompleto e um em dia; conferir lista do que falta.

- [ ] **Step 4: Commit**

```bash
git add src/components/animais/animal-detalhe.tsx "src/app/(app)/animais/[id]/page.tsx" src/lib/vacinas/data.ts
git commit -m "Mostra status de vacinas na ficha do animal."
```

---

### Task 8: Dashboard

**Files:**
- Modify: `src/lib/dashboard/data.ts` — `getProximosManejos`, `getUltimasOcorrencias`
- Modify: `src/lib/dashboard/mock.ts` se tipos `ProximoManejo` / `Ocorrencia` precisarem de campos (já têm `tipo: "vacinacao"`)

**Interfaces:**
- Consumes: `getLotesComVacinaPendente`, `getSessoesRecentes`
- Produces: widgets mistos pesagem + vacinação

- [ ] **Step 1: Próximos manejos**

Manter pesagens atrasadas; **concatenar** lotes com vacina pendente:

```ts
{
  id: `vacina-${lote.id}`,
  titulo: "Vacinação pendente",
  subtitulo: `${lote.nome} · ${lote.qtd_pendentes} animais`,
  data: new Date(), // ou próxima prevista se houver
  tipo: "vacinacao",
  href: `/sanidade/vacinas/aplicar?lote=${lote.id}`,
}
```

Limitar total ~5–8 itens (intercalar ou priorizar atrasados).

- [ ] **Step 2: Últimas ocorrências**

Buscar últimas sessões de vacinação; mapear:

```ts
{
  titulo: "Vacinação realizada",
  subtitulo: `${lote_nome} · ${qtd_aplicados} animais`,
  tipo: "vacinacao",
  href: `/sanidade/vacinas`, // ou /sanidade/vacinas?sessao=id se houver detalhe depois
}
```

Mesclar com pesagens por data, `limit` combinado 5–8.

- [ ] **Step 3: Verificar no `/dashboard`**

Após uma sessão: aparece em ocorrências; lote incompleto aparece em próximos manejos com ícone de seringa.

- [ ] **Step 4: Commit**

```bash
git add src/lib/dashboard/data.ts
git commit -m "Integra vacinas em proximos manejos e ocorrencias."
```

---

### Task 9: Polimento + verificação final da spec

**Files:**
- Possibly: `src/components/vacinas/*`, copy/empty states
- Modify: `docs/superpowers/specs/2026-10-11-vacinas-calendario-design.md` — Status: Implementado (MVP) só se tudo ok

- [ ] **Step 1: Checklist da spec §11**

- [ ] Sem aplicações + 2 vacinas → Incompleto  
- [ ] 1 de 2 → Incompleto  
- [ ] 2 sem intervalo → Em dia  
- [ ] Intervalo 180, última antiga → Atrasado  
- [ ] Animal novo no lote → não herda  
- [ ] Desmarcado → sem aplicação  
- [ ] Dashboard lista sessão e pendência  

- [ ] **Step 2: `npm test` + `npm run build`**

Expected: ambos OK.

- [ ] **Step 3: Commit final se houver ajustes**

```bash
git commit -m "Ajusta detalhes do MVP de vacinas."
```

---

## Self-review do plano (cobertura da spec)

| Spec | Task |
|------|------|
| Migration + RLS | 1 |
| Regras status + testes | 2 |
| Catálogo + protocolo | 3–4 |
| Aplicar lote | 5 |
| Hub status + o que falta | 6 |
| Ficha animal | 7 |
| Dashboard | 8 |
| Verificação | 9 |
| Fora de escopo (estoque, vermífugo, multi-UI) | não planejado |

Clarificação vs spec: `fazenda_id` null no protocolo fica no schema; MVP sempre preenche `fazenda_id` porque Joana/Cataguá já são propriedades da mesma fazenda.
