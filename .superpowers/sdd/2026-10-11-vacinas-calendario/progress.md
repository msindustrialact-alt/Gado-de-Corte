# SDD ledger — plan: docs/superpowers/plans/2026-10-11-vacinas-calendario.md

Ruling: executar no branch master atual — usuário escolheu Native nesta sessão sem pedir worktree; custo se errado: mais difícil abandonar o branch.

Pre-flight:
- Task1→2: database types consumed by data layer (Task3) — ok
- Task2→3/5/6/7: avaliarStatusAnimal — ok
- Task3→4/5/6: data.ts APIs — ok
- Task5→6/8: sessoes — ok

Task 1: complete (migration applied + types, tests: list_tables → vacinas tables present)

Task 2: Ruling: vitest@3.2.4 (--legacy-peer-deps) por conflito com @types/node 20 — custo: API vitest 3 vs 5.
Task 2: complete (tests: npm test → 6/6 pass)

Task 3: complete (data.ts + schema.ts)

Task 4: complete (protocolo UI + actions + badges)

Task 5: complete (aplicar lote)

Task 6: complete (hub)

Task 7: complete (ficha animal)

Task 8: complete (dashboard próximos + ocorrências)

Task 9: complete (npm test 6/6, npm run build OK; badge lote atrasado; spec → Implementado MVP)
