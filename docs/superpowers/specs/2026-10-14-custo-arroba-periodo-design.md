# Design: Custo da @ produzida por período e por lote

**Data:** 2026-10-14  
**Status:** Aguardando revisão  
**Rotas:** `/pesagens`, `/sanidade/medicacoes`, `/dashboard`, `/lucratividade`

## 1. Objetivo

Quando o gestor pesa um lote, ele vê os gastos reais desde a pesagem anterior (suplementação, medicamentos e outros), escolhe o que entra e grava esse total como custo do período. A @ produzida daquela pesagem fica congelada nesse valor.

O painel mostra o custo da @ da fazenda como custo total dividido pelas arrobas ganhas, e um filtro de lote mostra o mesmo número só daquele lote.

O medicamento passa a poder baixar estoque em mL e gerar custo de sanidade no lote.

### Critérios de sucesso

- Na pesagem, um botão abre os lançamentos do lote no intervalo e preenche o custo do período com a soma do que ficar marcado.
- O R$/@ da pesagem usa esse valor confirmado e não muda se um lançamento antigo de estoque for editado depois.
- O card **Custo @ (Produzida)** da fazenda é a soma dos custos dos períodos dividida pela soma das arrobas ganhas.
- Com um lote escolhido, o card mostra a @ daquele lote, o último intervalo e o acumulado separado em suplementação, medicamentos e outros.
- Um manejo com mL usados baixa o estoque pelo custo médio do mL e entra no custo de sanidade do lote.
- O painel de lucratividade não soma de novo o custo digitado na pesagem em cima das saídas de estoque.

## 2. Contexto atual

- A pesagem tem o campo `pesagens.custo_alimentacao`, rótulo “Custo da alimentação no período”. O usuário digita a soma na mão.
- A @ da pesagem é `custo_alimentacao / ((ganho_total_kg * 0,5) / 15)`, na view `vw_pesagens_resumo` e em `resumoSessaoLive`.
- O card do dashboard, em `getIndicadoresPesagem`, tira a média simples desses R$/@ de todas as pesagens concluídas, de todos os lotes.
- `lancamentos_lote` já guarda uso no lote com `categoria` (`alimentacao`, `sanidade`, `outro`), `custo_total`, `data_inicio` e `data_fim`. A alimentação lança isso e baixa o estoque pelo custo médio.
- A medicação é caderno: não baixa estoque e não tem custo. A dose é texto. A carência é em dias.
- A lucratividade soma `pesagens.custo_alimentacao` e, de novo, os `lancamentos_lote` de alimentação e outros. O mesmo saco contaria duas vezes se a pesagem passasse a copiar o estoque.

## 3. Decisões

| Tema | Decisão |
|------|---------|
| Verdade do custo acumulado do lote | Saídas em `lancamentos_lote` |
| Verdade da @ de uma pesagem fechada | Valor confirmado em `pesagens.custo_alimentacao` |
| O que entra na @ | O que o usuário deixar marcado no popup |
| Intervalo | Do dia seguinte à última pesagem concluída do lote até a data desta pesagem, inclusive |
| Primeira pesagem do lote | Tudo com `data_inicio` até a data da pesagem |
| Lançamento que começou antes | Aparece à parte, desmarcado. Sem rateio por dia |
| Congelamento | Ao confirmar, grava o total e uma foto do valor de cada linha |
| Nome da coluna | Continua `custo_alimentacao`. O rótulo na tela passa a “Custo do período” |
| Medicamento sem produto ou sem mL | Continua só caderno, custo zero |
| mL do manejo | Total do manejo, não mL por cabeça |
| Rateio do mL entre lotes | Igual por animal tratado |
| Animal sem lote | Baixa estoque e não entra na @ de lote nenhum |
| Lucratividade | Deixa de somar `pesagens.custo_alimentacao` |
| Filtro do dashboard | Só no card da @. GMD e peso médio continuam da fazenda inteira |
| Pesagens antigas | O valor já digitado conta inteiro como suplementação |

## 4. Medicação com saída em mL

### 4.1 Estoque

O produto continua no estoque. A unidade do frasco é `mL`. A entrada que já existe calcula o custo médio por mL. Exemplo: 500 mL a R$ 250 ficam a R$ 0,50/mL.

### 4.2 Vínculo

`medicamentos.produto_id` é opcional e aponta para `produtos` da mesma fazenda. O cadastro do medicamento ganha esse campo. Dose em texto e carência não mudam.

### 4.3 Manejo

No registrar manejo entra o campo **mL usados neste manejo**.

- Sem produto vinculado ou com mL vazio: grava o caderno como hoje, sem baixa e sem custo.
- Com produto e mL maior que zero: exige estoque suficiente do mL inteiro. Se faltar, o manejo não grava e a mensagem diz quanto tem disponível.
- O custo do manejo é `mL × custo médio` no momento da saída, arredondado em centavos como a entrada de estoque.
- Uma movimentação de saída cobre o total de mL.
- Cada animal tratado representa uma parte igual: `mL / quantidade de animais do manejo`.
- Os animais se agrupam pelo `lote_id` atual. Cada lote com pelo menos um animal gera um `lancamentos_lote` de categoria `sanidade`, com a quantidade e o custo da parte daquele lote, `data_inicio` igual à data do manejo e `qtd_cabecas_snapshot` igual aos animais daquele lote que entraram no manejo.
- A parte dos animais sem lote sai do estoque na mesma movimentação e não gera `lancamentos_lote`.
- Os centavos fecham: as partes dos lotes e a parte sem lote somam exatamente `ml_total` e `custo_total`. A última parte leva a diferença de arredondamento.
- A sessão guarda `ml_total` e `custo_total` para o histórico. O custo por lote fica no lançamento.

O custo do lote é a soma dessas partes. A ficha do animal não reparte por peso.

## 5. Popup na pesagem

O botão **Buscar custos do período** fica na sessão de pesagem, ao lado do custo do período. A sessão já tem id, lote e data. O formulário de criar a pesagem continua só com o campo manual.

A busca usa o lote da pesagem e a data da pesagem.

**Dentro do período, marcado por padrão:** `lancamentos_lote` do lote, não apagados, com `data_inicio` maior que a data da última pesagem concluída e menor ou igual à data desta pesagem. Sem pesagem anterior, `data_inicio` menor ou igual à data desta pesagem.

**Começou antes, desmarcado:** o mesmo lote, com `data_inicio` na data da última pesagem ou antes, e `data_fim` nulo ou `data_fim` maior ou igual ao dia seguinte dessa última pesagem.

Cada linha mostra data, nome do produto, quantidade com unidade, categoria e valor. Dá para desmarcar. O popup mostra subtotal de suplementação, medicamentos e outros, e o total do que está marcado.

**Usar este total** grava três coisas:

1. `pesagens.custo_alimentacao` com a soma marcada.
2. Linhas em `pesagem_custo_itens`: `pesagem_id`, `lancamento_lote_id`, `categoria`, `valor_snapshot` igual ao `custo_total` da linha na hora.
3. Substitui as linhas anteriores daquela pesagem. Confirmar de novo refaz a foto.

O usuário ainda pode editar o campo depois. A @ usa o número do campo, não a soma viva do estoque.

Se o campo editado divergir da soma das fotos, o painel reparte o número do campo na mesma proporção das fotos. Pesagem antiga, sem fotos, conta o campo inteiro como suplementação.

A fórmula da @ não muda: custo do período dividido pelas arrobas do ganho de peso vivo, rendimento 50%.

## 6. Dashboard

Com **Todos** selecionado, o card é:

`soma do custo do período das pesagens concluídas com ganho > 0` dividido por `soma das arrobas desses ganhos`.

Pesagem sem custo ou sem ganho fica de fora da conta. Não é média de R$/@.

O filtro lista os lotes ativos mais a opção Todos. Com um lote:

- a mesma conta, só com as pesagens concluídas daquele lote;
- o último intervalo: data, custo e R$/@ da pesagem concluída mais recente que tenha os dois números;
- o acumulado do lote em suplementação, medicamentos e outros, pelas fotos (ou pelo campo inteiro, se for pesagem antiga).

GMD, peso médio e lotes atrasados não usam esse filtro.

## 7. Lucratividade

`custo_suplementacao_ate_hoje` passa a ser só alimentação e outros de `vw_custos_lote_insumos`.

`custo_sanidade_ate_hoje` continua a soma de sanidade dessa view, agora incluindo o mL dos manejos.

O custo de compra do gado não entra no popup nem na @ produzida.

## 8. Fora desta entrega

- mL calculado pelo peso de cada animal.
- Rateio automático de um lançamento pelos dias que cruzam duas pesagens.
- Filtro de lote no GMD e no peso médio.
- Recalcular a @ de pesagem já fechada quando o estoque mudar.
- Custo de medicação já lançada antes desta entrega. Elas seguem sem valor.

## 9. Testes

- Intervalo com e sem pesagem anterior, inclusive o dia da pesagem e exclusivo o dia da anterior.
- Linha “começou antes” vem desmarcada e só entra no total se o usuário marcar.
- Confirmar, editar o campo e ver a @ usar o campo.
- Editar o `custo_total` do lançamento depois não altera `valor_snapshot` nem a @ já gravada.
- Manejo com dois lotes e um animal sem lote: estoque baixa o total, cada lote recebe a parte dos seus animais, o sem lote não gera lançamento.
- Estoque insuficiente não grava o manejo.
- Manejo sem mL não baixa estoque.
- Card da fazenda: dois lotes com arrobas diferentes não saem na média simples.
- Filtro de um lote não muda o GMD do card.
- Lucratividade de um lote com pesagem preenchida pelo popup não soma o mesmo valor duas vezes.
