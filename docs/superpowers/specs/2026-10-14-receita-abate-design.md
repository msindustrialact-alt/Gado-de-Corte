# Design: Receita de abate

**Data:** 2026-10-14  
**Status:** Aprovado  
**Rota:** `/financeiro/receitas`

## 1. Objetivo

No dia em que animais vão para o abate, o gestor abre uma receita, marca quem sai pelo brinco, informa o peso de cada um e fecha a carga do jeito que o frigorífico paga. Ao confirmar, a venda fica gravada e os animais saem do rebanho ativo e do lote.

A lucratividade não muda nesta versão. Ela continua estimando o lote.

### Critérios de sucesso

- Dá para buscar animais ativos pelo brinco e marcar uma carga, inclusive misturando lotes.
- O peso vivo total é a soma dos pesos digitados. A quantidade é o número de animais marcados.
- A venda usa uma das três formas: rendimento, desconto de arrobas ou arrobas pagas.
- O valor bruto é arrobas pagas vezes o valor da arroba. O líquido desconta as outras despesas.
- Animal em carência aparece com a data de liberação. A venda só fecha se o gestor marcar que está ciente.
- Confirmar grava a venda e baixa todos os animais no mesmo passo. Se algo falhar, ninguém é baixado.
- A venda confirmada abre só para consulta.

## 2. Contexto atual

- **Financeiro → Receitas** existe no menu e cai na página genérica “em breve” (`src/app/(app)/[...modulo]/page.tsx`). Não há tabela de venda.
- O animal já tem `status` (`ativo`, `vendido`, `abatido`, `morto`, `transferido`), `motivo_saida` (`abate` entre outros), `data_saida`, `peso_saida`, `lote_id` e `piquete_id`. O cadastro individual já preenche saída um a um.
- O peso de referência do animal ativo é `peso_atual`, atualizado pela pesagem.
- A carência de abate está nas aplicações de medicação: data do manejo mais `carencia_dias`. A ficha do animal mostra “abate a partir de” essa data. Carência 0 não bloqueia.
- A @ de carcaça usa 15 kg. A @ de peso vivo usa 30 kg, que é o mesmo que 50% de rendimento. As funções já existem: `kgParaArroba` em `src/lib/pesagens.ts` e `kgParaArrobaViva` em `src/lib/lucratividade.ts`.
- A lucratividade do lote é projeção. Ela não lê venda realizada.

## 3. Decisões

| Tema | Decisão |
|------|---------|
| Onde fica | `/financeiro/receitas`. A página específica substitui o “em breve” só nessa rota |
| Uma venda | Um comprador, uma data, uma forma de fechamento, vários animais |
| Lotes | A mesma carga pode misturar lotes. Cada linha guarda o lote de onde o animal saiu |
| Peso | Por animal, editável, começa com `peso_atual`. Sem peso atual, o campo nasce vazio |
| Peso vivo total | Soma dos pesos dos marcados. Não é digitado |
| Formas | `rendimento`, `desconto` ou `arrobas_pagas`. Uma por venda |
| @ viva | Peso vivo total ÷ 30 |
| Diferença de @ | @ viva − @ pagas. Pode ser desconto ou acréscimo |
| Valor | Bruto = @ pagas × R$/@. Líquido = bruto − despesas |
| Carência | Avisa. Exige a caixa “Estou ciente da carência” só se alguém ainda estiver no prazo |
| Baixa | `status = abatido`, `motivo_saida = abate`, `data_saida`, `peso_saida`, `lote_id` e `piquete_id` nulos |
| Falha | Tudo na mesma transação. Nenhum animal muda se a venda não gravar |
| Depois de confirmar | Só consulta. Sem editar, sem estornar e sem apagar |
| Lucratividade | Fora. O valor não entra na projeção do lote |
| Dinheiro por cabeça | Fora. O valor é da carga |

## 4. Conta

A conta roda no cliente para mostrar e de novo no servidor ao gravar. O servidor não confia nos totais enviados pela tela.

Arrobas ficam com 3 casas. Dinheiro fica com 2 casas. O arredondamento é o de `Math.round`: meia unidade sobe.

`@ viva = round(peso vivo total / 30, 3 casas)`.

### 4.1 Rendimento

O rendimento é um percentual maior que 0 e no máximo 80. Exemplo: 54.

`@ pagas = round(peso vivo total × (rendimento / 100) / 15, 3 casas)`.

Com 50%, @ pagas é igual a @ viva. Acima de 50%, @ pagas passa @ viva e a diferença fica negativa: é acréscimo, não desconto.

### 4.2 Desconto de arrobas

O gestor lança linhas com descrição e arrobas maiores que zero. A soma das linhas é o desconto. Sem linhas, informa um desconto único, que pode ser zero. Não dá para ter linhas e um total diferente da soma.

`@ pagas = round(@ viva − desconto, 3 casas)`.

@ pagas não pode ser negativa. O desconto não pode passar a @ viva.

### 4.3 Arrobas pagas

O gestor informa as @ pagas, zero ou mais. A diferença é `@ viva − @ pagas` e pode ser negativa.

### 4.4 Valor

`valor bruto = round(@ pagas × valor da @, 2 casas)`.

Cada despesa tem descrição e valor zero ou mais. O total de despesas é a soma. O valor líquido é o bruto menos esse total e pode ficar negativo se a despesa passar o bruto.

O valor da @ é zero ou mais.

## 5. Tela

### 5.1 Lista

`/financeiro/receitas` lista as vendas da fazenda, da mais nova para a mais antiga: data, comprador, frigorífico quando houver, quantidade, peso vivo e valor líquido. O botão **Nova receita** abre o formulário.

### 5.2 Nova receita

`/financeiro/receitas/nova` é uma tela só.

**Cabeçalho.** Data da saída, obrigatória e não futura. Nome do comprador, obrigatório. Frigorífico, documento e cidade, opcionais. Observação, opcional.

**Animais.** Busca por brinco ou nome. Filtro opcional por lote. Só entram animais `ativo` e não apagados. A linha mostra brinco, nome se houver, lote, data e peso da última pesagem, e o peso desta venda. Marcar e desmarcar. Quantidade e peso vivo total aparecem calculados.

**Fechamento.** Três opções marcáveis, uma ativa. Os campos mudam conforme a seção 4. Abaixo, sempre: diferença de @ (com o texto “desconto” ou “acréscimo”), valor da @, valor bruto, linhas de despesa e valor líquido.

**Carência.** Para cada marcado cuja liberação é depois da data da venda, a tela mostra brinco, medicamento e a data “abate a partir de”. A caixa de ciência fica visível nesse caso e a confirmação exige ela marcada.

**Confirmar.** O botão grava e abre a venda em consulta.

### 5.3 Consulta

`/financeiro/receitas/[id]` mostra os mesmos dados, sem edição. Na ficha do animal abatido por essa venda, um link mostra a data e o comprador e abre essa consulta. O valor da carga não é repartido na ficha.

## 6. Carência

Para cada animal marcado, olha as aplicações não apagadas com `carencia_dias` maior que zero. A liberação é a data da aplicação mais os dias, a mesma conta de `dataLiberacao`.

Se a data da venda é igual ou posterior à liberação, o animal está livre. Se a data da venda é anterior, ele está em carência. Vale a liberação mais distante quando há mais de um medicamento.

Carência não informada ou zero não gera aviso.

## 7. Gravação

Uma função no banco, `registrar_venda_abate`, em uma transação, com o usuário autenticado e a fazenda ativa.

Ela trava os animais escolhidos. Recusa se algum não for ativo, não for da fazenda, já estiver em outra venda ou vier sem peso maior que zero. Recalcula peso, arrobas, valores e carência. Recusa se a forma estiver incompleta, se @ pagas for negativa ou se houver carência sem ciência.

Grava:

- `vendas_abate`: cabeçalho, forma, peso vivo, quantidade, @ viva, @ pagas, diferença de @, rendimento quando for o caso, valores e o flag de ciência. Documento do comprador é texto livre.
- `venda_abate_animais`: animal, brinco, lote e nome do lote no momento, peso e a data de liberação quando houver carência.
- `venda_abate_descontos`: só na forma desconto, quando houver linhas.
- `venda_abate_despesas`: uma linha por despesa.

Em seguida atualiza cada animal: `status = abatido`, `motivo_saida = abate`, `data_saida` igual à data da venda, `peso_saida` igual ao peso da linha, `lote_id` nulo e `piquete_id` nulo. A quantidade atualizada tem que ser igual à quantidade da venda. Se não for, a transação desfaz tudo.

Pesagens já gravadas, inclusive itens de uma sessão aberta, não são apagadas. O animal deixa de aparecer nas listas de ativos.

Não há exclusão nesta versão. Um animal só pode estar em uma venda.

## 8. Fora desta versão

- Entrar o valor na lucratividade do lote.
- Repartir o valor da carga por animal.
- Estornar, editar ou apagar uma venda confirmada.
- Morte, descarte, transferência ou venda de boi em pé.
- Nota fiscal, GTA em arquivo e impressão de romaneio.
- Cadastro reutilizável de comprador. O nome fica no texto da venda.

## 9. Testes

Funções puras, sem banco:

- 1.000 kg a 54% pagam `round(1000 × 0,54 / 15, 3)` arrobas, e a diferença para 1.000 ÷ 30 é acréscimo.
- 1.000 kg a 50% pagam a mesma @ viva.
- Desconto em linhas 1,5 + 0,5 sobre @ viva de 1.000 kg desconta 2 e não aceita resultado negativo.
- Forma arrobas pagas guarda a diferença, inclusive negativa.
- Despesas 100 + 50 saem do bruto. Líquido pode ser negativo.
- Liberação no dia da venda não pede ciência. Liberação no dia seguinte pede.
