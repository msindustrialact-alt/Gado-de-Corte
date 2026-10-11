# Design: Calendário de Vacinas (Sanidade)

**Data:** 2026-10-11  
**Status:** Implementado (MVP)  
**Rota:** `/sanidade/vacinas`

## 1. Objetivo

Permitir que o gestor controle o **calendário sanitário do rebanho**: quais vacinas cada animal deve ter, o que já foi realizado (por **data de realização**) e o que falta — com status claro (**Em dia**, **Incompleto**, **Atrasado**) e fluxo operacional por **lote**, no mesmo espírito do módulo de pesagens.

### Critérios de sucesso

- Dá para ver, por animal e agregado por lote, se as vacinas estão em dia.
- Se estiver incompleto, o sistema lista **o que falta**.
- O dia a dia registra aplicação no **lote**, gerando realização por animal (com desmarcar quem faltou).
- **Próximos manejos** e **Últimas ocorrências** do dashboard passam a incluir vacinas (dados reais, não mock).
- Modelo suporta **vários protocolos** e vínculo futuro por fazenda; MVP usa **um protocolo ativo** para Joana e Cataguá.

## 2. Contexto atual

- Menu Sanidade → Vacinas / Vermífugos / Tratamentos existe; páginas caem no catch-all `EmBreve`.
- **Não há** tabelas nem campos de vacina no banco.
- Categoria `sanidade` em estoque/lançamentos serve só a **custo**, não a calendário.
- Animais já têm `data_nascimento`, `categoria`, `fase_produtiva`, `lote_id`, `propriedade`, `status` — úteis para elegibilidade.
- Dashboard: `getProximosManejos` e `getUltimasOcorrencias` hoje só usam **pesagens**.

## 3. Decisões de produto

| Tema | Decisão |
|------|--------|
| Verdade do controle | **Animal** |
| Fluxo operacional | **Lote** (atalho); também filtro “quem falta” |
| Regras de dose | Protocolo (obrigatórias + idade mínima) **+** reforço por `intervalo_dias` quando a vacina tiver |
| Protocolos | Modelo multi-protocolo; MVP = 1 ativo para as duas propriedades |
| Status | Calculado (não materializado em coluna no animal) |
| Base do status | Sempre a **data de realização** da aplicação |
| Dashboard | Integra próximos + últimas ocorrências |
| Escopo MVP | Só **Vacinas** (não vermífugos/tratamentos nesta entrega) |

## 4. Arquitetura de dados

### 4.1 Princípio

**Abordagem escolhida:** catálogo + protocolo + sessões/aplicações; status **derivado** em query/serviço.

Evitar: flag `vacinas_em_dia` gravada no animal (desatualiza) ou controle só por lote (animal novo / faltoso no curral).

### 4.2 Tabelas

Todas com `fazenda_id`, `created_at`, `updated_at`, `deleted_at` (soft delete) e RLS via `minhas_fazendas()`, no padrão de estoque/pesagens. Datas civis com `hoje_fazenda()` (`America/Sao_Paulo`).

#### `vacinas`

Catálogo de produtos vacinais da fazenda (ou compartilhado no tenant).

| Coluna | Tipo | Notas |
|--------|------|--------|
| id | uuid PK | |
| fazenda_id | uuid NOT NULL | |
| nome | text NOT NULL | único por fazenda (ativo) |
| intervalo_dias | int NULL | null = sem reforço automático por intervalo |
| ativa | boolean NOT NULL DEFAULT true | |
| observacoes | text NULL | |

#### `protocolos_vacina`

| Coluna | Tipo | Notas |
|--------|------|--------|
| id | uuid PK | |
| fazenda_id | uuid NULL | **null = protocolo global do tenant** (MVP); preenchido = escopo daquela fazenda (futuro) |
| nome | text NOT NULL | ex.: “Padrão Joana e Cataguá” |
| ativo | boolean NOT NULL DEFAULT true | no MVP, no máximo um ativo global |
| vigencia_inicio | date NULL | opcional |
| vigencia_fim | date NULL | opcional |

Regra MVP: ao ativar um protocolo global, desativar os outros globais ativos (ou validar na app).

#### `protocolo_vacinas`

Itens do protocolo (quais vacinas entram e quando passam a ser devidas).

| Coluna | Tipo | Notas |
|--------|------|--------|
| id | uuid PK | |
| protocolo_id | uuid NOT NULL | FK |
| vacina_id | uuid NOT NULL | FK |
| obrigatoria | boolean NOT NULL DEFAULT true | |
| idade_minima_dias | int NULL | null = devida desde o nascimento / sem mínimo |
| ordem | int NOT NULL DEFAULT 0 | exibição |
| UNIQUE | (protocolo_id, vacina_id) | |

#### `vacinacao_sessoes`

Espelha o conceito de sessão de pesagem: um evento operacional no lote.

| Coluna | Tipo | Notas |
|--------|------|--------|
| id | uuid PK | |
| fazenda_id | uuid NOT NULL | |
| lote_id | uuid NOT NULL | FK lotes |
| data | date NOT NULL | **data de realização** (≤ hoje_fazenda()) |
| qtd_animais_lote | int NULL | snapshot |
| qtd_aplicados | int NULL | snapshot |
| observacoes | text NULL | |
| created_by | uuid NULL | |

Uma sessão pode aplicar **uma ou mais vacinas** no mesmo dia (via aplicações).

#### `vacinacao_aplicacoes`

Realização por animal × vacina (fonte da verdade do calendário).

| Coluna | Tipo | Notas |
|--------|------|--------|
| id | uuid PK | |
| fazenda_id | uuid NOT NULL | |
| sessao_id | uuid NULL | null se lançamento individual sem sessão |
| animal_id | uuid NOT NULL | FK animais |
| vacina_id | uuid NOT NULL | FK vacinas |
| lote_id | uuid NULL | lote no momento (auditoria) |
| data | date NOT NULL | **data de realização** |
| UNIQUE parcial | (animal_id, vacina_id, data) WHERE deleted_at IS NULL | evita duplicata no mesmo dia |

Índices: `(fazenda_id, animal_id)`, `(fazenda_id, data DESC)`, `(vacina_id, data DESC)`.

### 4.3 Fora do MVP (não implementar agora)

- Baixa automática de estoque ao vacinar (pode linkar `produto_id` depois).
- Vermífugos / tratamentos (reutilizar padrão depois).
- Campanhas oficiais com “mês da campanha” complexo.
- Multi-protocolo ativo por propriedade na UI (modelo já permite).

## 5. Regras de status

Avaliar só animais `status = ativo` e `deleted_at IS NULL`.

### 5.1 Protocolo aplicável

1. Preferir protocolo `ativo` com `fazenda_id` da fazenda ativa (futuro).
2. Senão, protocolo `ativo` com `fazenda_id IS NULL` (MVP).
3. Sem protocolo ativo → UI orienta a cadastrar; status “sem protocolo”.

### 5.2 Vacina devida para o animal

Para cada item obrigatório do protocolo:

- Se `idade_minima_dias` é null → devida.
- Se animal tem `data_nascimento` → devida quando `hoje - nascimento >= idade_minima_dias`.
- Sem nascimento e com idade mínima → tratar como **indefinido** (não marcar Em dia às cegas); exibir aviso “sem data de nascimento”.

### 5.3 Cobertura por realização

Para cada vacina devida:

- Buscar a **última** `vacinacao_aplicacoes.data` do par animal×vacina.
- Se **nunca** aplicada → falta (contribui para **Incompleto**).
- Se a vacina tem `intervalo_dias`:
  - `proxima = ultima + intervalo_dias`
  - se `hoje > proxima` → **Atrasado** para essa vacina
  - se `hoje <= proxima` → ok nessa vacina
- Se sem intervalo: ter ao menos uma realização após se tornar devida → ok.

### 5.4 Status do animal (agregado)

| Status | Regra |
|--------|--------|
| **Em dia** | Todas as vacinas devidas estão ok (realizadas e dentro do intervalo se houver) |
| **Incompleto** | Falta ao menos uma vacina devida **nunca** realizada |
| **Atrasado** | Não está incompleto por “nunca”, mas ao menos uma está fora do intervalo / prazo |
| Prioridade de exibição | Atrasado > Incompleto > Em dia (para alertas); na lista, filtros separados |

“O que falta” = lista de vacinas devidas sem realização válida (nunca ou vencidas pelo intervalo), com `proxima_prevista` quando calculável.

### 5.5 Status do lote (agregado)

- Contagem de animais ativos no lote por status.
- Lote “em dia” só se **todos** os ativos estiverem Em dia.
- Útil nos KPIs e em Próximos manejos (“Lote X · 12 atrasados”).

## 6. Fluxos de UI

### 6.1 `/sanidade/vacinas` (hub)

1. **KPIs:** animais Em dia / Incompleto / Atrasado; lotes com pendência; sessões no mês.
2. **Lista principal:** por **lote** (ou toggle animal), com badge de status e resumo do que falta.
3. Ações: **Aplicar no lote**, filtrar “só pendentes”, abrir protocolo.
4. Seções/abas secundárias: Protocolo · Histórico de sessões · Catálogo de vacinas.

### 6.2 Aplicar no lote (fluxo padrão)

1. Escolher lote.
2. Escolher uma ou mais vacinas do catálogo/protocolo.
3. Data de realização (default `hoje_fazenda()`).
4. Lista de animais ativos do lote — **todos marcados**; desmarcar faltosos.
5. Salvar → cria `vacinacao_sessoes` + N `vacinacao_aplicacoes`.
6. Recalcula visão de status (só leitura calculada).

### 6.3 Atalho “quem falta”

Filtro por vacina/status → seleção de animais/lotes → mesma tela de aplicação (pré-filtrada).

### 6.4 Ficha do animal

Bloco **Vacinas**: status, lista do que falta, histórico de aplicações, link para aplicar no lote do animal.

### 6.5 Dashboard

- **Próximos manejos:** lotes/animais com vacina atrasada ou a vencer em janela curta (ex. 7 dias), `tipo: vacinacao`, href para vacinas/aplicar.
- **Últimas ocorrências:** últimas `vacinacao_sessoes` (“Vacinação · Lote · N animais”), fallback aplicações avulsas se necessário.

## 7. Camada de aplicação (Next.js)

Seguir padrões existentes (`pesagens`, `animais`):

| Peça | Responsabilidade |
|------|------------------|
| `src/lib/vacinas.ts` | Tipos, labels, formatadores, regras puras de status |
| `src/lib/vacinas/data.ts` | Queries Supabase |
| `src/lib/vacinas/schema.ts` | Zod dos formulários |
| `src/app/(app)/sanidade/vacinas/**` | Pages + server actions |
| `src/components/vacinas/**` | UI (hub, aplicar, protocolo, badges) |
| Migration Supabase | Tabelas + RLS + índices |
| Dashboard `data.ts` | Estender próximos/ocorrências |

Rotas dedicadas sob `/sanidade/vacinas` **antes** do catch-all `[...modulo]`.

## 8. Segurança

- RLS em todas as tabelas: `fazenda_id IN (SELECT minhas_fazendas())`.
- Soft delete; listagens ignoram `deleted_at`.
- Não confiar em status enviado pelo client — recalcular no server ao exibir.

## 9. Integrações futuras (não bloquear MVP)

- Lançamento de custo `categoria = sanidade` ao concluir sessão.
- Protocolo distinto Joana vs Cataguá (`fazenda_id` no protocolo).
- Vermífugos reutilizando o mesmo padrão (protocolo + sessão + aplicação).

## 10. Escopo explícito do MVP

**Inclui**

- Migration + tipos
- CRUD catálogo vacinas
- CRUD protocolo (1 ativo global) + itens
- Sessão aplicar no lote
- Hub com status Em dia / Incompleto / Atrasado + o que falta
- Bloco na ficha do animal
- Dashboard próximos + ocorrências

**Não inclui**

- App offline / sync
- Estoque automático
- Campanhas MAPA complexas
- UI multi-protocolo por fazenda (só modelo pronto)

## 11. Testes / verificação

- Animal sem nenhuma aplicação + protocolo com 2 vacinas → Incompleto com 2 faltantes.
- Aplicar 1 de 2 → Incompleto com 1 faltante.
- Aplicar as 2 sem intervalo → Em dia.
- Vacina com intervalo 180 dias; última há 200 dias → Atrasado.
- Animal novo no lote após sessão → continua Incompleto (não herda lote).
- Desmarcar animal na sessão → não gera aplicação para ele.
- Dashboard lista sessão recente e lote com atraso.

## 12. Ordem sugerida de implementação (para `writing-plans`)

1. Migration + RLS + regenerate types  
2. Domínio `lib/vacinas` (regras de status + testes unitários das regras)  
3. Catálogo + protocolo UI  
4. Aplicar no lote  
5. Hub `/sanidade/vacinas`  
6. Ficha do animal  
7. Dashboard  
8. Seed opcional de vacinas comuns (nomes vazios ou exemplos BR)

---

## Apêndice: glossário

- **Realização:** registro de que o animal recebeu a vacina em uma data.  
- **Devida:** vacina obrigatória do protocolo cuja idade mínima já foi atingida.  
- **Sessão:** evento de curral (lote + data) que gera várias aplicações.
