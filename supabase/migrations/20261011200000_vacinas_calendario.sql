-- Calendário de vacinas (MVP)
-- Depende de: fazendas, lotes, animais, minhas_fazendas(), hoje_fazenda(), set_updated_at()

-- ---------------------------------------------------------------------------
-- vacinas (catálogo)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vacinas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fazenda_id uuid NOT NULL REFERENCES public.fazendas (id),
  nome text NOT NULL,
  intervalo_dias integer NULL CHECK (intervalo_dias IS NULL OR intervalo_dias > 0),
  ativa boolean NOT NULL DEFAULT true,
  observacoes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NULL,
  deleted_at timestamptz NULL,
  CONSTRAINT vacinas_nome_fazenda_unique UNIQUE (fazenda_id, nome)
);

CREATE INDEX IF NOT EXISTS idx_vacinas_fazenda
  ON public.vacinas (fazenda_id)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_vacinas_updated_at ON public.vacinas;
CREATE TRIGGER trg_vacinas_updated_at
  BEFORE UPDATE ON public.vacinas
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.vacinas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vacinas_select ON public.vacinas;
CREATE POLICY vacinas_select ON public.vacinas
  FOR SELECT USING (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS vacinas_insert ON public.vacinas;
CREATE POLICY vacinas_insert ON public.vacinas
  FOR INSERT WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS vacinas_update ON public.vacinas;
CREATE POLICY vacinas_update ON public.vacinas
  FOR UPDATE
  USING (fazenda_id IN (SELECT public.minhas_fazendas()))
  WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

-- ---------------------------------------------------------------------------
-- protocolos_vacina
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.protocolos_vacina (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fazenda_id uuid NULL REFERENCES public.fazendas (id),
  nome text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  vigencia_inicio date NULL,
  vigencia_fim date NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NULL,
  deleted_at timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS protocolos_vacina_um_ativo_por_fazenda
  ON public.protocolos_vacina (fazenda_id)
  WHERE ativo = true AND deleted_at IS NULL AND fazenda_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_protocolos_vacina_fazenda
  ON public.protocolos_vacina (fazenda_id)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_protocolos_vacina_updated_at ON public.protocolos_vacina;
CREATE TRIGGER trg_protocolos_vacina_updated_at
  BEFORE UPDATE ON public.protocolos_vacina
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.protocolos_vacina ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS protocolos_vacina_select ON public.protocolos_vacina;
CREATE POLICY protocolos_vacina_select ON public.protocolos_vacina
  FOR SELECT USING (
    fazenda_id IN (SELECT public.minhas_fazendas())
    OR fazenda_id IS NULL
  );

DROP POLICY IF EXISTS protocolos_vacina_insert ON public.protocolos_vacina;
CREATE POLICY protocolos_vacina_insert ON public.protocolos_vacina
  FOR INSERT WITH CHECK (
    fazenda_id IN (SELECT public.minhas_fazendas())
  );

DROP POLICY IF EXISTS protocolos_vacina_update ON public.protocolos_vacina;
CREATE POLICY protocolos_vacina_update ON public.protocolos_vacina
  FOR UPDATE
  USING (fazenda_id IN (SELECT public.minhas_fazendas()))
  WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

-- ---------------------------------------------------------------------------
-- protocolo_vacinas (itens)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.protocolo_vacinas (
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

CREATE INDEX IF NOT EXISTS idx_protocolo_vacinas_protocolo
  ON public.protocolo_vacinas (protocolo_id)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_protocolo_vacinas_updated_at ON public.protocolo_vacinas;
CREATE TRIGGER trg_protocolo_vacinas_updated_at
  BEFORE UPDATE ON public.protocolo_vacinas
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.protocolo_vacinas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS protocolo_vacinas_select ON public.protocolo_vacinas;
CREATE POLICY protocolo_vacinas_select ON public.protocolo_vacinas
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.protocolos_vacina p
      WHERE p.id = protocolo_id
        AND (
          p.fazenda_id IN (SELECT public.minhas_fazendas())
          OR p.fazenda_id IS NULL
        )
    )
  );

DROP POLICY IF EXISTS protocolo_vacinas_insert ON public.protocolo_vacinas;
CREATE POLICY protocolo_vacinas_insert ON public.protocolo_vacinas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.protocolos_vacina p
      WHERE p.id = protocolo_id
        AND p.fazenda_id IN (SELECT public.minhas_fazendas())
    )
  );

DROP POLICY IF EXISTS protocolo_vacinas_update ON public.protocolo_vacinas;
CREATE POLICY protocolo_vacinas_update ON public.protocolo_vacinas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.protocolos_vacina p
      WHERE p.id = protocolo_id
        AND p.fazenda_id IN (SELECT public.minhas_fazendas())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.protocolos_vacina p
      WHERE p.id = protocolo_id
        AND p.fazenda_id IN (SELECT public.minhas_fazendas())
    )
  );

-- ---------------------------------------------------------------------------
-- vacinacao_sessoes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vacinacao_sessoes (
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

CREATE INDEX IF NOT EXISTS idx_vacinacao_sessoes_fazenda_data
  ON public.vacinacao_sessoes (fazenda_id, data DESC)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_vacinacao_sessoes_updated_at ON public.vacinacao_sessoes;
CREATE TRIGGER trg_vacinacao_sessoes_updated_at
  BEFORE UPDATE ON public.vacinacao_sessoes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.vacinacao_sessoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vacinacao_sessoes_select ON public.vacinacao_sessoes;
CREATE POLICY vacinacao_sessoes_select ON public.vacinacao_sessoes
  FOR SELECT USING (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS vacinacao_sessoes_insert ON public.vacinacao_sessoes;
CREATE POLICY vacinacao_sessoes_insert ON public.vacinacao_sessoes
  FOR INSERT WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS vacinacao_sessoes_update ON public.vacinacao_sessoes;
CREATE POLICY vacinacao_sessoes_update ON public.vacinacao_sessoes
  FOR UPDATE
  USING (fazenda_id IN (SELECT public.minhas_fazendas()))
  WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

-- ---------------------------------------------------------------------------
-- vacinacao_aplicacoes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vacinacao_aplicacoes (
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

CREATE UNIQUE INDEX IF NOT EXISTS vacinacao_aplicacoes_animal_vacina_data
  ON public.vacinacao_aplicacoes (animal_id, vacina_id, data)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_vacinacao_aplicacoes_fazenda_animal
  ON public.vacinacao_aplicacoes (fazenda_id, animal_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_vacinacao_aplicacoes_fazenda_data
  ON public.vacinacao_aplicacoes (fazenda_id, data DESC)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_vacinacao_aplicacoes_updated_at ON public.vacinacao_aplicacoes;
CREATE TRIGGER trg_vacinacao_aplicacoes_updated_at
  BEFORE UPDATE ON public.vacinacao_aplicacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.vacinacao_aplicacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vacinacao_aplicacoes_select ON public.vacinacao_aplicacoes;
CREATE POLICY vacinacao_aplicacoes_select ON public.vacinacao_aplicacoes
  FOR SELECT USING (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS vacinacao_aplicacoes_insert ON public.vacinacao_aplicacoes;
CREATE POLICY vacinacao_aplicacoes_insert ON public.vacinacao_aplicacoes
  FOR INSERT WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS vacinacao_aplicacoes_update ON public.vacinacao_aplicacoes;
CREATE POLICY vacinacao_aplicacoes_update ON public.vacinacao_aplicacoes
  FOR UPDATE
  USING (fazenda_id IN (SELECT public.minhas_fazendas()))
  WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));
