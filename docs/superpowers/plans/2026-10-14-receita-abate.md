# Receita de abate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gravar uma receita de abate, fechar a carga em uma das três formas do frigorífico e baixar os animais do rebanho no mesmo passo.

**Architecture:** A conta pura fica em `src/lib/receitas/calculo.ts`. A tela em `/financeiro/receitas` mostra a conta. A função `registrar_venda_abate` trava os animais, refaz a conta e grava a venda junto com a baixa.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, Supabase Postgres, RLS por `minhas_fazendas()`.

**Spec:** `docs/superpowers/specs/2026-10-14-receita-abate-design.md`

## Global Constraints

- Rota `/financeiro/receitas`. Uma venda, uma forma, vários animais, lotes mistos.
- Peso vivo total é a soma dos pesos. Quantidade é o número de marcados.
- @ viva = peso ÷ 30, 3 casas, `Math.round`. Dinheiro em 2 casas.
- Rendimento: @ pagas = peso × (rendimento / 100) / 15. Rendimento maior que 0 e no máximo 80.
- Desconto: linhas ou um total. @ pagas = @ viva − desconto, nunca negativa.
- Arrobas pagas: o número informado. A diferença pode ser negativa.
- Valor bruto = @ pagas × R$/@. Líquido = bruto − despesas, e pode ser negativo.
- Carência pede ciência só quando a liberação é depois da data da venda.
- Baixa: `abatido`, motivo `abate`, data e peso de saída, `lote_id` e `piquete_id` nulos.
- Falha desfaz tudo. Venda confirmada é só consulta. Lucratividade não muda.

## Review Focus

- Rendimento de 54% em 1.000 kg paga 36 @ e a diferença para 33,333 @ é acréscimo.
- Desconto maior que a @ viva é recusado.
- Liberação no dia da venda não pede ciência. No dia seguinte pede.
- Despesa maior que o bruto deixa o líquido negativo.
- Animal que já está em outra venda, ou que não está ativo, não entra.

---

### Task 1: Conta pura

**Files:**
- Create: `src/lib/receitas/calculo.ts`
- Test: `src/lib/receitas/calculo.test.ts`

**Interfaces:**
- Consumes: nada
- Produces: `fecharVenda(entrada: EntradaFechamento): FechamentoVenda` e `exigeCienciaCarencia(liberacoes: (string | null)[], dataVenda: string): boolean`

- [ ] Testes da spec e implementação até `npx vitest run src/lib/receitas/calculo.test.ts` passar.

### Task 2: Banco

**Files:**
- Create: `supabase/migrations/20261014220000_receita_abate.sql`

- [ ] Tabelas `vendas_abate`, `venda_abate_animais`, `venda_abate_descontos`, `venda_abate_despesas` com RLS de leitura e inserção.
- [ ] `registrar_venda_abate(jsonb)` refaz a conta, exige ciência e baixa os animais. Sem política de update ou delete.

### Task 3: Telas

**Files:**
- Create: `src/lib/receitas/data.ts`
- Create: `src/app/(app)/financeiro/receitas/actions.ts`
- Create: `src/app/(app)/financeiro/receitas/page.tsx`
- Create: `src/app/(app)/financeiro/receitas/nova/page.tsx`
- Create: `src/app/(app)/financeiro/receitas/[id]/page.tsx`
- Create: `src/components/receitas/receitas-lista.tsx`
- Create: `src/components/receitas/receita-nova-tela.tsx`
- Create: `src/components/receitas/receita-detalhe.tsx`
- Modify: `src/app/(app)/animais/[id]/page.tsx`
- Modify: `src/components/animais/animal-detalhe.tsx`

- [ ] Lista, formulário e consulta. A ficha do animal abatido aponta para a venda.
- [ ] `npx tsc --noEmit` sem erro.

**Execução:** nativa nesta sessão, pedida por “pode implementar”. Sem commit.
