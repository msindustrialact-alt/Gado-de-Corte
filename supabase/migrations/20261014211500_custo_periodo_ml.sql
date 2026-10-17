-- Custo do período na pesagem e saída de medicamento em mL.

ALTER TABLE public.medicamentos
  ADD COLUMN IF NOT EXISTS produto_id uuid REFERENCES public.produtos (id);

ALTER TABLE public.medicacao_sessoes
  ADD COLUMN IF NOT EXISTS ml_total numeric(14, 3);

ALTER TABLE public.medicacao_sessoes
  ADD COLUMN IF NOT EXISTS custo_total numeric(14, 2);

ALTER TABLE public.medicacao_sessoes
  DROP CONSTRAINT IF EXISTS medicacao_sessoes_ml_total_check;

ALTER TABLE public.medicacao_sessoes
  ADD CONSTRAINT medicacao_sessoes_ml_total_check
  CHECK (ml_total IS NULL OR ml_total > 0);

ALTER TABLE public.medicacao_sessoes
  DROP CONSTRAINT IF EXISTS medicacao_sessoes_custo_total_check;

ALTER TABLE public.medicacao_sessoes
  ADD CONSTRAINT medicacao_sessoes_custo_total_check
  CHECK (custo_total IS NULL OR custo_total >= 0);

CREATE TABLE IF NOT EXISTS public.pesagem_custo_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fazenda_id uuid NOT NULL REFERENCES public.fazendas (id),
  pesagem_id uuid NOT NULL REFERENCES public.pesagens (id),
  lancamento_lote_id uuid NOT NULL REFERENCES public.lancamentos_lote (id),
  categoria public.categoria_produto NOT NULL,
  valor_snapshot numeric(14, 2) NOT NULL CHECK (valor_snapshot >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pesagem_id, lancamento_lote_id)
);

ALTER TABLE public.pesagem_custo_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pesagem_custo_itens_select ON public.pesagem_custo_itens;
CREATE POLICY pesagem_custo_itens_select ON public.pesagem_custo_itens
  FOR SELECT USING (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS pesagem_custo_itens_insert ON public.pesagem_custo_itens;
CREATE POLICY pesagem_custo_itens_insert ON public.pesagem_custo_itens
  FOR INSERT WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS pesagem_custo_itens_delete ON public.pesagem_custo_itens;
CREATE POLICY pesagem_custo_itens_delete ON public.pesagem_custo_itens
  FOR DELETE USING (fazenda_id IN (SELECT public.minhas_fazendas()));

CREATE OR REPLACE FUNCTION public.registrar_saida_ml(
  p_produto_id uuid,
  p_data date,
  p_observacoes text,
  p_partes jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_fazenda uuid;
  v_estoque numeric;
  v_custo_medio numeric;
  v_ml numeric := 0;
  v_custo numeric := 0;
  v_mov_id uuid;
  v_user uuid := auth.uid();
  v_parte jsonb;
  v_lote uuid;
BEGIN
  IF p_partes IS NULL OR jsonb_typeof(p_partes) <> 'array' OR jsonb_array_length(p_partes) = 0 THEN
    RAISE EXCEPTION 'Nenhuma parte de mL informada';
  END IF;

  SELECT p.fazenda_id, p.estoque_atual, p.custo_medio
    INTO v_fazenda, v_estoque, v_custo_medio
  FROM public.produtos p
  WHERE p.id = p_produto_id
    AND p.deleted_at IS NULL
    AND p.ativo = true
    AND p.fazenda_id IN (SELECT public.minhas_fazendas())
  FOR UPDATE;

  IF v_fazenda IS NULL THEN
    RAISE EXCEPTION 'Produto não encontrado';
  END IF;

  FOR v_parte IN SELECT value FROM jsonb_array_elements(p_partes)
  LOOP
    v_ml := v_ml + (v_parte->>'ml')::numeric;
    v_custo := v_custo + (v_parte->>'custo')::numeric;
  END LOOP;

  IF v_ml <= 0 THEN
    RAISE EXCEPTION 'Quantidade inválida';
  END IF;

  IF v_ml > v_estoque THEN
    RAISE EXCEPTION 'Estoque insuficiente (disponível: %)', v_estoque;
  END IF;

  INSERT INTO public.estoque_movimentacoes (
    fazenda_id, produto_id, tipo, quantidade, custo_unitario, custo_total, data, observacoes, created_by
  ) VALUES (
    v_fazenda, p_produto_id, 'saida', v_ml, v_custo_medio, round(v_custo, 2),
    COALESCE(p_data, public.hoje_fazenda()), p_observacoes, v_user
  )
  RETURNING id INTO v_mov_id;

  UPDATE public.produtos
  SET estoque_atual = v_estoque - v_ml
  WHERE id = p_produto_id;

  FOR v_parte IN SELECT value FROM jsonb_array_elements(p_partes)
  LOOP
    IF coalesce(v_parte->>'lote_id', '') = '' THEN
      CONTINUE;
    END IF;

    v_lote := (v_parte->>'lote_id')::uuid;

    IF NOT EXISTS (
      SELECT 1 FROM public.lotes l
      WHERE l.id = v_lote
        AND l.fazenda_id = v_fazenda
        AND l.deleted_at IS NULL
    ) THEN
      RAISE EXCEPTION 'Lote não encontrado';
    END IF;

    INSERT INTO public.lancamentos_lote (
      fazenda_id, lote_id, produto_id, categoria,
      data_inicio, quantidade, custo_total, qtd_cabecas_snapshot,
      estoque_movimentacao_id, observacoes, created_by
    ) VALUES (
      v_fazenda,
      v_lote,
      p_produto_id,
      'sanidade',
      COALESCE(p_data, public.hoje_fazenda()),
      (v_parte->>'ml')::numeric,
      round((v_parte->>'custo')::numeric, 2),
      (v_parte->>'cabecas')::integer,
      v_mov_id,
      p_observacoes,
      v_user
    );
  END LOOP;

  RETURN v_mov_id;
END;
$$;

GRANT SELECT, INSERT, DELETE ON public.pesagem_custo_itens TO authenticated;

GRANT EXECUTE ON FUNCTION public.registrar_saida_ml(uuid, date, text, jsonb) TO authenticated;
