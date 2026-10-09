-- RPCs atômicas: entrada de estoque e lançamento de uso no lote (com baixa).

CREATE OR REPLACE FUNCTION public.registrar_entrada_estoque(
  p_produto_id uuid,
  p_quantidade numeric,
  p_custo_unitario numeric,
  p_data date DEFAULT public.hoje_fazenda(),
  p_observacoes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_fazenda uuid;
  v_estoque numeric;
  v_custo_medio numeric;
  v_novo_estoque numeric;
  v_novo_custo numeric;
  v_mov_id uuid;
  v_user uuid := auth.uid();
BEGIN
  IF p_quantidade IS NULL OR p_quantidade <= 0 THEN
    RAISE EXCEPTION 'Quantidade inválida';
  END IF;
  IF p_custo_unitario IS NULL OR p_custo_unitario < 0 THEN
    RAISE EXCEPTION 'Custo unitário inválido';
  END IF;

  SELECT fazenda_id, estoque_atual, custo_medio
    INTO v_fazenda, v_estoque, v_custo_medio
  FROM public.produtos
  WHERE id = p_produto_id
    AND deleted_at IS NULL
    AND fazenda_id IN (SELECT public.minhas_fazendas())
  FOR UPDATE;

  IF v_fazenda IS NULL THEN
    RAISE EXCEPTION 'Produto não encontrado';
  END IF;

  v_novo_estoque := v_estoque + p_quantidade;
  IF v_novo_estoque > 0 THEN
    v_novo_custo := ((v_estoque * v_custo_medio) + (p_quantidade * p_custo_unitario)) / v_novo_estoque;
  ELSE
    v_novo_custo := p_custo_unitario;
  END IF;

  INSERT INTO public.estoque_movimentacoes (
    fazenda_id, produto_id, tipo, quantidade, custo_unitario, custo_total, data, observacoes, created_by
  ) VALUES (
    v_fazenda, p_produto_id, 'entrada', p_quantidade, p_custo_unitario,
    round(p_quantidade * p_custo_unitario, 2), COALESCE(p_data, public.hoje_fazenda()),
    p_observacoes, v_user
  )
  RETURNING id INTO v_mov_id;

  UPDATE public.produtos
  SET estoque_atual = v_novo_estoque,
      custo_medio = round(v_novo_custo, 4)
  WHERE id = p_produto_id;

  RETURN v_mov_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.lancar_uso_lote(
  p_lote_id uuid,
  p_produto_id uuid,
  p_quantidade numeric,
  p_data_inicio date DEFAULT public.hoje_fazenda(),
  p_data_fim date DEFAULT NULL,
  p_observacoes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_fazenda uuid;
  v_estoque numeric;
  v_custo_medio numeric;
  v_categoria public.categoria_produto;
  v_cabecas integer;
  v_custo_total numeric;
  v_mov_id uuid;
  v_lanc_id uuid;
  v_user uuid := auth.uid();
BEGIN
  IF p_quantidade IS NULL OR p_quantidade <= 0 THEN
    RAISE EXCEPTION 'Quantidade inválida';
  END IF;

  IF p_data_fim IS NOT NULL AND p_data_fim < COALESCE(p_data_inicio, public.hoje_fazenda()) THEN
    RAISE EXCEPTION 'Período inválido';
  END IF;

  SELECT l.fazenda_id INTO v_fazenda
  FROM public.lotes l
  WHERE l.id = p_lote_id
    AND l.deleted_at IS NULL
    AND l.fazenda_id IN (SELECT public.minhas_fazendas());

  IF v_fazenda IS NULL THEN
    RAISE EXCEPTION 'Lote não encontrado';
  END IF;

  SELECT p.estoque_atual, p.custo_medio, p.categoria
    INTO v_estoque, v_custo_medio, v_categoria
  FROM public.produtos p
  WHERE p.id = p_produto_id
    AND p.fazenda_id = v_fazenda
    AND p.deleted_at IS NULL
    AND p.ativo = true
  FOR UPDATE;

  IF v_estoque IS NULL THEN
    RAISE EXCEPTION 'Produto não encontrado';
  END IF;

  IF p_quantidade > v_estoque THEN
    RAISE EXCEPTION 'Estoque insuficiente (disponível: %)', v_estoque;
  END IF;

  SELECT count(*)::integer INTO v_cabecas
  FROM public.animais a
  WHERE a.lote_id = p_lote_id
    AND a.fazenda_id = v_fazenda
    AND a.status = 'ativo'
    AND a.deleted_at IS NULL;

  IF v_cabecas IS NULL OR v_cabecas <= 0 THEN
    RAISE EXCEPTION 'Lote sem animais ativos';
  END IF;

  v_custo_total := round(p_quantidade * v_custo_medio, 2);

  INSERT INTO public.estoque_movimentacoes (
    fazenda_id, produto_id, tipo, quantidade, custo_unitario, custo_total, data, observacoes, created_by
  ) VALUES (
    v_fazenda, p_produto_id, 'saida', p_quantidade, v_custo_medio, v_custo_total,
    COALESCE(p_data_inicio, public.hoje_fazenda()), p_observacoes, v_user
  )
  RETURNING id INTO v_mov_id;

  UPDATE public.produtos
  SET estoque_atual = v_estoque - p_quantidade
  WHERE id = p_produto_id;

  INSERT INTO public.lancamentos_lote (
    fazenda_id, lote_id, produto_id, categoria,
    data_inicio, data_fim, quantidade, custo_total,
    qtd_cabecas_snapshot, estoque_movimentacao_id, observacoes, created_by
  ) VALUES (
    v_fazenda, p_lote_id, p_produto_id, v_categoria,
    COALESCE(p_data_inicio, public.hoje_fazenda()), p_data_fim,
    p_quantidade, v_custo_total, v_cabecas, v_mov_id, p_observacoes, v_user
  )
  RETURNING id INTO v_lanc_id;

  RETURN v_lanc_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.registrar_entrada_estoque(uuid, numeric, numeric, date, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lancar_uso_lote(uuid, uuid, numeric, date, date, text) TO authenticated;
