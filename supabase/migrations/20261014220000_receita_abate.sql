-- Receita de abate: uma venda, várias cabeças, baixa no mesmo passo.

CREATE TABLE IF NOT EXISTS public.vendas_abate (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fazenda_id uuid NOT NULL REFERENCES public.fazendas (id),
  data date NOT NULL,
  comprador_nome text NOT NULL,
  comprador_documento text,
  frigorifico text,
  cidade text,
  observacoes text,
  forma text NOT NULL CHECK (forma IN ('rendimento', 'desconto', 'arrobas_pagas')),
  peso_vivo_total numeric(14, 3) NOT NULL CHECK (peso_vivo_total > 0),
  qtd_animais integer NOT NULL CHECK (qtd_animais > 0),
  rendimento_pct numeric(5, 2),
  arrobas_vivas numeric(14, 3) NOT NULL CHECK (arrobas_vivas >= 0),
  arrobas_pagas numeric(14, 3) NOT NULL CHECK (arrobas_pagas >= 0),
  diferenca_arrobas numeric(14, 3) NOT NULL,
  valor_arroba numeric(14, 2) NOT NULL CHECK (valor_arroba >= 0),
  valor_bruto numeric(14, 2) NOT NULL CHECK (valor_bruto >= 0),
  despesas_total numeric(14, 2) NOT NULL CHECK (despesas_total >= 0),
  valor_liquido numeric(14, 2) NOT NULL,
  ciencia_carencia boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  CONSTRAINT vendas_abate_rendimento_check CHECK (
    (forma = 'rendimento' AND rendimento_pct > 0 AND rendimento_pct <= 80)
    OR (forma <> 'rendimento' AND rendimento_pct IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS vendas_abate_fazenda_data_idx
  ON public.vendas_abate (fazenda_id, data DESC);

CREATE TABLE IF NOT EXISTS public.venda_abate_animais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fazenda_id uuid NOT NULL REFERENCES public.fazendas (id),
  venda_id uuid NOT NULL REFERENCES public.vendas_abate (id),
  animal_id uuid NOT NULL UNIQUE REFERENCES public.animais (id),
  lote_id uuid REFERENCES public.lotes (id),
  lote_nome text,
  brinco text NOT NULL,
  peso_kg numeric(14, 3) NOT NULL CHECK (peso_kg > 0),
  carencia_ate date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS venda_abate_animais_venda_idx
  ON public.venda_abate_animais (venda_id);

CREATE TABLE IF NOT EXISTS public.venda_abate_descontos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fazenda_id uuid NOT NULL REFERENCES public.fazendas (id),
  venda_id uuid NOT NULL REFERENCES public.vendas_abate (id),
  descricao text NOT NULL,
  arrobas numeric(14, 3) NOT NULL CHECK (arrobas > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.venda_abate_despesas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fazenda_id uuid NOT NULL REFERENCES public.fazendas (id),
  venda_id uuid NOT NULL REFERENCES public.vendas_abate (id),
  descricao text NOT NULL,
  valor numeric(14, 2) NOT NULL CHECK (valor >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vendas_abate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venda_abate_animais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venda_abate_descontos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venda_abate_despesas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vendas_abate_select ON public.vendas_abate;
CREATE POLICY vendas_abate_select ON public.vendas_abate
  FOR SELECT USING (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS vendas_abate_insert ON public.vendas_abate;
CREATE POLICY vendas_abate_insert ON public.vendas_abate
  FOR INSERT WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS venda_abate_animais_select ON public.venda_abate_animais;
CREATE POLICY venda_abate_animais_select ON public.venda_abate_animais
  FOR SELECT USING (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS venda_abate_animais_insert ON public.venda_abate_animais;
CREATE POLICY venda_abate_animais_insert ON public.venda_abate_animais
  FOR INSERT WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS venda_abate_descontos_select ON public.venda_abate_descontos;
CREATE POLICY venda_abate_descontos_select ON public.venda_abate_descontos
  FOR SELECT USING (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS venda_abate_descontos_insert ON public.venda_abate_descontos;
CREATE POLICY venda_abate_descontos_insert ON public.venda_abate_descontos
  FOR INSERT WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS venda_abate_despesas_select ON public.venda_abate_despesas;
CREATE POLICY venda_abate_despesas_select ON public.venda_abate_despesas
  FOR SELECT USING (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS venda_abate_despesas_insert ON public.venda_abate_despesas;
CREATE POLICY venda_abate_despesas_insert ON public.venda_abate_despesas
  FOR INSERT WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

GRANT SELECT, INSERT ON public.vendas_abate TO authenticated;
GRANT SELECT, INSERT ON public.venda_abate_animais TO authenticated;
GRANT SELECT, INSERT ON public.venda_abate_descontos TO authenticated;
GRANT SELECT, INSERT ON public.venda_abate_despesas TO authenticated;

CREATE OR REPLACE FUNCTION public.registrar_venda_abate(p_venda jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  v_data date;
  v_forma text;
  v_comprador text;
  v_ciencia boolean;
  v_valor_arroba numeric;
  v_rendimento numeric;
  v_qtd integer;
  v_peso numeric;
  v_vivas numeric;
  v_pagas numeric;
  v_diferenca numeric;
  v_desconto numeric;
  v_bruto numeric;
  v_despesas numeric;
  v_liquido numeric;
  v_fazenda uuid;
  v_venda_id uuid;
  v_item jsonb;
  v_linhas integer;
  v_carencia date;
  v_tem_carencia boolean := false;
  v_atualizados integer;
  v_animal record;
BEGIN
  IF p_venda IS NULL OR jsonb_typeof(p_venda) <> 'object' THEN
    RAISE EXCEPTION 'Venda inválida';
  END IF;

  IF coalesce(p_venda->>'data', '') !~ '^\d{4}-\d{2}-\d{2}$' THEN
    RAISE EXCEPTION 'Informe a data da saída';
  END IF;

  v_data := (p_venda->>'data')::date;

  IF v_data > public.hoje_fazenda() THEN
    RAISE EXCEPTION 'A data da saída não pode ser futura';
  END IF;

  v_forma := p_venda->>'forma';

  IF v_forma NOT IN ('rendimento', 'desconto', 'arrobas_pagas') THEN
    RAISE EXCEPTION 'Escolha a forma de fechamento';
  END IF;

  v_comprador := btrim(coalesce(p_venda->>'comprador_nome', ''));

  IF char_length(v_comprador) < 2 THEN
    RAISE EXCEPTION 'Informe o nome do comprador';
  END IF;

  IF p_venda->>'valor_arroba' IS NULL OR (p_venda->>'valor_arroba')::numeric < 0 THEN
    RAISE EXCEPTION 'Informe o valor da @';
  END IF;

  v_valor_arroba := round((p_venda->>'valor_arroba')::numeric, 2);
  v_ciencia := coalesce((p_venda->>'ciencia_carencia')::boolean, false);

  IF p_venda->'animais' IS NULL
     OR jsonb_typeof(p_venda->'animais') <> 'array'
     OR jsonb_array_length(p_venda->'animais') = 0 THEN
    RAISE EXCEPTION 'Marque ao menos um animal';
  END IF;

  CREATE TEMP TABLE tmp_receita_animais (
    animal_id uuid NOT NULL,
    peso numeric NOT NULL
  ) ON COMMIT DROP;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_venda->'animais')
  LOOP
    IF coalesce(v_item->>'animal_id', '') = ''
       OR v_item->>'peso' IS NULL
       OR (v_item->>'peso')::numeric <= 0 THEN
      RAISE EXCEPTION 'Cada animal precisa de um peso maior que zero';
    END IF;

    INSERT INTO tmp_receita_animais (animal_id, peso)
    VALUES ((v_item->>'animal_id')::uuid, round((v_item->>'peso')::numeric, 3));
  END LOOP;

  IF (SELECT count(*) FROM tmp_receita_animais)
     <> (SELECT count(DISTINCT animal_id) FROM tmp_receita_animais) THEN
    RAISE EXCEPTION 'Animal repetido na venda';
  END IF;

  PERFORM a.id
  FROM public.animais a
  JOIN tmp_receita_animais t ON t.animal_id = a.id
  FOR UPDATE OF a;

  CREATE TEMP TABLE tmp_receita_ok ON COMMIT DROP AS
  SELECT
    a.id AS animal_id,
    a.fazenda_id,
    a.brinco,
    a.lote_id,
    l.nome AS lote_nome,
    t.peso,
    NULL::date AS carencia_ate
  FROM tmp_receita_animais t
  JOIN public.animais a ON a.id = t.animal_id
  LEFT JOIN public.lotes l ON l.id = a.lote_id
  WHERE a.status = 'ativo'
    AND a.deleted_at IS NULL
    AND a.fazenda_id IN (SELECT public.minhas_fazendas());

  SELECT count(*) INTO v_qtd FROM tmp_receita_animais;

  IF (SELECT count(*) FROM tmp_receita_ok) <> v_qtd THEN
    RAISE EXCEPTION 'Algum animal não está ativo nesta fazenda';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.venda_abate_animais v
    JOIN tmp_receita_ok t ON t.animal_id = v.animal_id
  ) THEN
    RAISE EXCEPTION 'Algum animal já está em outra venda';
  END IF;

  SELECT fazenda_id INTO v_fazenda FROM tmp_receita_ok LIMIT 1;

  IF EXISTS (SELECT 1 FROM tmp_receita_ok WHERE fazenda_id <> v_fazenda) THEN
    RAISE EXCEPTION 'A carga precisa ser de uma fazenda só';
  END IF;

  FOR v_animal IN SELECT animal_id FROM tmp_receita_ok
  LOOP
    SELECT max(aplic.data + aplic.carencia_dias)
      INTO v_carencia
    FROM public.medicacao_aplicacoes aplic
    WHERE aplic.animal_id = v_animal.animal_id
      AND aplic.deleted_at IS NULL
      AND aplic.carencia_dias > 0;

    IF v_carencia IS NOT NULL AND v_carencia > v_data THEN
      v_tem_carencia := true;
      UPDATE tmp_receita_ok
      SET carencia_ate = v_carencia
      WHERE animal_id = v_animal.animal_id;
    END IF;
  END LOOP;

  IF v_tem_carencia AND NOT v_ciencia THEN
    RAISE EXCEPTION 'Confirme que está ciente da carência';
  END IF;

  SELECT coalesce(sum(peso), 0) INTO v_peso FROM tmp_receita_ok;
  v_vivas := round(v_peso / 30, 3);
  v_rendimento := NULL;

  IF v_forma = 'rendimento' THEN
    IF p_venda->>'rendimento_pct' IS NULL THEN
      RAISE EXCEPTION 'O rendimento é maior que 0 e no máximo 80%%';
    END IF;

    v_rendimento := round((p_venda->>'rendimento_pct')::numeric, 2);

    IF v_rendimento <= 0 OR v_rendimento > 80 THEN
      RAISE EXCEPTION 'O rendimento é maior que 0 e no máximo 80%%';
    END IF;

    v_pagas := round(v_peso * (v_rendimento / 100) / 15, 3);
  ELSIF v_forma = 'desconto' THEN
    v_linhas := coalesce(jsonb_array_length(p_venda->'descontos'), 0);
    v_desconto := 0;

    IF v_linhas > 0 THEN
      FOR v_item IN SELECT value FROM jsonb_array_elements(p_venda->'descontos')
      LOOP
        IF char_length(btrim(coalesce(v_item->>'descricao', ''))) = 0
           OR v_item->>'arrobas' IS NULL
           OR (v_item->>'arrobas')::numeric <= 0 THEN
          RAISE EXCEPTION 'Cada linha de desconto precisa de nome e arrobas maiores que zero';
        END IF;

        v_desconto := v_desconto + round((v_item->>'arrobas')::numeric, 3);
      END LOOP;

      IF p_venda->>'desconto_arrobas' IS NOT NULL
         AND p_venda->>'desconto_arrobas' <> ''
         AND round((p_venda->>'desconto_arrobas')::numeric, 3) <> round(v_desconto, 3) THEN
        RAISE EXCEPTION 'O desconto total tem que ser a soma das linhas';
      END IF;
    ELSE
      IF p_venda->>'desconto_arrobas' IS NULL OR (p_venda->>'desconto_arrobas')::numeric < 0 THEN
        RAISE EXCEPTION 'Informe o desconto de @';
      END IF;

      v_desconto := round((p_venda->>'desconto_arrobas')::numeric, 3);
    END IF;

    v_pagas := round(v_vivas - v_desconto, 3);

    IF v_pagas < 0 THEN
      RAISE EXCEPTION 'O desconto não pode passar as @ do peso vivo';
    END IF;
  ELSE
    IF p_venda->>'arrobas_pagas' IS NULL OR (p_venda->>'arrobas_pagas')::numeric < 0 THEN
      RAISE EXCEPTION 'Informe as @ pagas';
    END IF;

    v_pagas := round((p_venda->>'arrobas_pagas')::numeric, 3);
  END IF;

  v_diferenca := round(v_vivas - v_pagas, 3);
  v_bruto := round(v_pagas * v_valor_arroba, 2);
  v_despesas := 0;
  v_linhas := coalesce(jsonb_array_length(p_venda->'despesas'), 0);

  IF v_linhas > 0 THEN
    FOR v_item IN SELECT value FROM jsonb_array_elements(p_venda->'despesas')
    LOOP
      IF char_length(btrim(coalesce(v_item->>'descricao', ''))) = 0
         OR v_item->>'valor' IS NULL
         OR (v_item->>'valor')::numeric < 0 THEN
        RAISE EXCEPTION 'Cada despesa precisa de nome e valor zero ou mais';
      END IF;

      v_despesas := v_despesas + round((v_item->>'valor')::numeric, 2);
    END LOOP;
  END IF;

  v_liquido := round(v_bruto - v_despesas, 2);

  INSERT INTO public.vendas_abate (
    fazenda_id, data, comprador_nome, comprador_documento, frigorifico, cidade,
    observacoes, forma, peso_vivo_total, qtd_animais, rendimento_pct,
    arrobas_vivas, arrobas_pagas, diferenca_arrobas, valor_arroba,
    valor_bruto, despesas_total, valor_liquido, ciencia_carencia, created_by
  ) VALUES (
    v_fazenda,
    v_data,
    v_comprador,
    nullif(btrim(coalesce(p_venda->>'comprador_documento', '')), ''),
    nullif(btrim(coalesce(p_venda->>'frigorifico', '')), ''),
    nullif(btrim(coalesce(p_venda->>'cidade', '')), ''),
    nullif(btrim(coalesce(p_venda->>'observacoes', '')), ''),
    v_forma,
    v_peso,
    v_qtd,
    v_rendimento,
    v_vivas,
    v_pagas,
    v_diferenca,
    v_valor_arroba,
    v_bruto,
    v_despesas,
    v_liquido,
    v_ciencia,
    auth.uid()
  )
  RETURNING id INTO v_venda_id;

  INSERT INTO public.venda_abate_animais (
    fazenda_id, venda_id, animal_id, lote_id, lote_nome, brinco, peso_kg, carencia_ate
  )
  SELECT fazenda_id, v_venda_id, animal_id, lote_id, lote_nome, brinco, peso, carencia_ate
  FROM tmp_receita_ok;

  IF v_forma = 'desconto' AND coalesce(jsonb_array_length(p_venda->'descontos'), 0) > 0 THEN
    INSERT INTO public.venda_abate_descontos (fazenda_id, venda_id, descricao, arrobas)
    SELECT
      v_fazenda,
      v_venda_id,
      btrim(item->>'descricao'),
      round((item->>'arrobas')::numeric, 3)
    FROM jsonb_array_elements(p_venda->'descontos') item;
  END IF;

  IF coalesce(jsonb_array_length(p_venda->'despesas'), 0) > 0 THEN
    INSERT INTO public.venda_abate_despesas (fazenda_id, venda_id, descricao, valor)
    SELECT
      v_fazenda,
      v_venda_id,
      btrim(item->>'descricao'),
      round((item->>'valor')::numeric, 2)
    FROM jsonb_array_elements(p_venda->'despesas') item;
  END IF;

  UPDATE public.animais a
  SET
    status = 'abatido',
    motivo_saida = 'abate',
    data_saida = v_data,
    peso_saida = t.peso,
    lote_id = NULL,
    piquete_id = NULL
  FROM tmp_receita_ok t
  WHERE a.id = t.animal_id
    AND a.status = 'ativo'
    AND a.deleted_at IS NULL
    AND a.fazenda_id = v_fazenda;

  GET DIAGNOSTICS v_atualizados = ROW_COUNT;

  IF v_atualizados <> v_qtd THEN
    RAISE EXCEPTION 'Não foi possível baixar todos os animais';
  END IF;

  RETURN v_venda_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.registrar_venda_abate(jsonb) TO authenticated;
