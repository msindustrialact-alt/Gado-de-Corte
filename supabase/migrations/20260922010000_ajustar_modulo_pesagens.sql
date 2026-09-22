-- Ajuste do módulo de pesagens (preserva dados existentes).
-- NÃO recria tabelas: apenas ALTER / CREATE OR REPLACE / DROP+CREATE view.

-- ---------------------------------------------------------------------------
-- 4) Fuso horário único
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.hoje_fazenda()
RETURNS date
LANGUAGE sql
STABLE
AS $$
  SELECT (now() AT TIME ZONE 'America/Sao_Paulo')::date;
$$;

COMMENT ON FUNCTION public.hoje_fazenda() IS
  'Data civil da fazenda no fuso America/Sao_Paulo (nunca current_date sem fuso).';

ALTER TABLE public.pesagens
  ALTER COLUMN data SET DEFAULT public.hoje_fazenda();

ALTER TABLE public.pesagens
  DROP CONSTRAINT IF EXISTS pesagens_data_passado;

ALTER TABLE public.pesagens
  ADD CONSTRAINT pesagens_data_passado
  CHECK (data <= public.hoje_fazenda());

-- ---------------------------------------------------------------------------
-- Enums novos
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'condicao_pesagem') THEN
    CREATE TYPE public.condicao_pesagem AS ENUM (
      'sem_jejum',
      'jejum_ate_12h',
      'jejum_mais_12h'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'confiabilidade_gmd') THEN
    CREATE TYPE public.confiabilidade_gmd AS ENUM (
      'alta',
      'media',
      'baixa',
      'sem_referencia'
    );
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2, 5, 6) Colunas novas em pesagens
-- ---------------------------------------------------------------------------
ALTER TABLE public.pesagens
  ADD COLUMN IF NOT EXISTS qtd_animais_lote integer,
  ADD COLUMN IF NOT EXISTS qtd_pesados integer,
  ADD COLUMN IF NOT EXISTS cobertura_percentual numeric(6,2),
  ADD COLUMN IF NOT EXISTS condicao_pesagem public.condicao_pesagem,
  ADD COLUMN IF NOT EXISTS peso_medio numeric,
  ADD COLUMN IF NOT EXISTS uniformidade_cv numeric;

ALTER TABLE public.pesagens
  DROP CONSTRAINT IF EXISTS pesagens_cobertura_check;

ALTER TABLE public.pesagens
  ADD CONSTRAINT pesagens_cobertura_check
  CHECK (
    cobertura_percentual IS NULL
    OR (cobertura_percentual >= 0 AND cobertura_percentual <= 100)
  );

ALTER TABLE public.pesagens
  DROP CONSTRAINT IF EXISTS pesagens_uniformidade_check;

ALTER TABLE public.pesagens
  ADD CONSTRAINT pesagens_uniformidade_check
  CHECK (uniformidade_cv IS NULL OR uniformidade_cv >= 0);

ALTER TABLE public.pesagens
  DROP CONSTRAINT IF EXISTS pesagens_qtd_check;

ALTER TABLE public.pesagens
  ADD CONSTRAINT pesagens_qtd_check
  CHECK (
    (qtd_animais_lote IS NULL OR qtd_animais_lote >= 0)
    AND (qtd_pesados IS NULL OR qtd_pesados >= 0)
  );

-- ---------------------------------------------------------------------------
-- 5) Coluna confiabilidade em pesagem_itens
-- ---------------------------------------------------------------------------
ALTER TABLE public.pesagem_itens
  ADD COLUMN IF NOT EXISTS confiabilidade public.confiabilidade_gmd;

-- ---------------------------------------------------------------------------
-- 3 + 8) sincronizar_peso_animal: flag de sync + fallback peso_entrada
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sincronizar_peso_animal(p_animal_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_peso numeric;
  v_data date;
  v_peso_entrada numeric;
  v_data_entrada date;
BEGIN
  SELECT i.peso_kg, p.data
    INTO v_peso, v_data
  FROM public.pesagem_itens i
  JOIN public.pesagens p
    ON p.id = i.pesagem_id
   AND p.fazenda_id = i.fazenda_id
  WHERE i.animal_id = p_animal_id
    AND p.deleted_at IS NULL
    AND p.status = 'concluida'
  ORDER BY p.data DESC, p.updated_at DESC
  LIMIT 1;

  PERFORM set_config('app.pesagem_sync', '1', true);

  IF v_peso IS NOT NULL THEN
    UPDATE public.animais
    SET peso_atual = v_peso,
        data_ultima_pesagem = v_data
    WHERE id = p_animal_id;
  ELSE
    SELECT a.peso_entrada, a.data_entrada
      INTO v_peso_entrada, v_data_entrada
    FROM public.animais a
    WHERE a.id = p_animal_id;

    UPDATE public.animais
    SET peso_atual = v_peso_entrada,
        data_ultima_pesagem = v_data_entrada
    WHERE id = p_animal_id;
  END IF;
END;
$function$;

-- Bloqueia edição manual de peso quando já existe histórico de pesagem concluída,
-- exceto quando a origem é sincronizar_peso_animal (app.pesagem_sync = '1').
CREATE OR REPLACE FUNCTION public.trg_animais_bloquear_peso_manual()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_sync text;
  v_tem_historico boolean;
BEGIN
  IF NEW.peso_atual IS NOT DISTINCT FROM OLD.peso_atual
     AND NEW.data_ultima_pesagem IS NOT DISTINCT FROM OLD.data_ultima_pesagem THEN
    RETURN NEW;
  END IF;

  v_sync := current_setting('app.pesagem_sync', true);

  IF v_sync = '1' THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.pesagem_itens i
    JOIN public.pesagens p
      ON p.id = i.pesagem_id
     AND p.fazenda_id = i.fazenda_id
    WHERE i.animal_id = NEW.id
      AND p.deleted_at IS NULL
      AND p.status = 'concluida'
  ) INTO v_tem_historico;

  IF v_tem_historico THEN
    RAISE EXCEPTION
      'Peso atual só pode ser alterado pelo módulo de pesagens. Use Registrar pesagem ou o histórico do animal.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_animais_bloquear_peso_manual ON public.animais;

CREATE TRIGGER trg_animais_bloquear_peso_manual
  BEFORE UPDATE OF peso_atual, data_ultima_pesagem ON public.animais
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_animais_bloquear_peso_manual();

-- 8) Reabrir/arquivar já disparam trg_pesagens_sync (status/deleted_at).
-- Reforça a função para cobrir qualquer UPDATE relevante (já existente).
CREATE OR REPLACE FUNCTION public.trg_pesagens_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  r record;
BEGIN
  IF TG_OP = 'UPDATE' AND (
    OLD.status IS DISTINCT FROM NEW.status
    OR OLD.deleted_at IS DISTINCT FROM NEW.deleted_at
    OR OLD.data IS DISTINCT FROM NEW.data
  ) THEN
    FOR r IN
      SELECT animal_id FROM public.pesagem_itens WHERE pesagem_id = NEW.id
    LOOP
      PERFORM public.sincronizar_peso_animal(r.animal_id);
    END LOOP;
  END IF;

  RETURN NEW;
END;
$function$;

-- ---------------------------------------------------------------------------
-- View atualizada (cobertura, uniformidade, condição, custo/@ estimada)
-- Arroba estimada = peso_vivo * 0.5 / 15  (= peso_vivo / 30 com rendimento 50%)
-- DROP + CREATE: CREATE OR REPLACE não permite reordenar/inserir colunas no meio.
-- ---------------------------------------------------------------------------
DROP VIEW IF EXISTS public.vw_pesagens_resumo;

CREATE VIEW public.vw_pesagens_resumo AS
SELECT
  p.id,
  p.fazenda_id,
  p.lote_id,
  p.data,
  p.status,
  p.custo_alimentacao,
  p.gmd_medio,
  p.ganho_total_kg,
  p.observacoes,
  p.created_at,
  p.updated_at,
  p.deleted_at,
  p.condicao_pesagem,
  p.qtd_animais_lote,
  p.cobertura_percentual,
  p.uniformidade_cv,
  l.nome AS lote_nome,
  l.objetivo AS lote_objetivo,
  l.status AS lote_status,
  COALESCE(p.qtd_pesados, count(i.id)::integer) AS qtd_pesados,
  COALESCE(p.peso_medio, avg(i.peso_kg)) AS peso_medio,
  sum(i.peso_kg) AS peso_total,
  CASE
    WHEN p.ganho_total_kg IS NOT NULL
         AND p.ganho_total_kg > 0
         AND p.custo_alimentacao IS NOT NULL
    THEN p.custo_alimentacao / ((p.ganho_total_kg * 0.5) / 15.0)
    ELSE NULL
  END AS custo_por_arroba
FROM public.pesagens p
JOIN public.lotes l
  ON l.id = p.lote_id
 AND l.fazenda_id = p.fazenda_id
LEFT JOIN public.pesagem_itens i
  ON i.pesagem_id = p.id
 AND i.fazenda_id = p.fazenda_id
WHERE p.deleted_at IS NULL
GROUP BY
  p.id,
  l.nome,
  l.objetivo,
  l.status;
