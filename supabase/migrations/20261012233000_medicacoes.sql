-- Caderno de medicações (sem baixa de estoque).
-- Depende de: fazendas, lotes, animais, minhas_fazendas(), hoje_fazenda(), set_updated_at()

CREATE TABLE IF NOT EXISTS public.medicamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fazenda_id uuid NOT NULL REFERENCES public.fazendas (id),
  nome text NOT NULL,
  via text NOT NULL CHECK (via IN ('injetavel', 'pour_on')),
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NULL,
  deleted_at timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS medicamentos_nome_fazenda_ativo
  ON public.medicamentos (fazenda_id, nome)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_medicamentos_fazenda
  ON public.medicamentos (fazenda_id)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_medicamentos_updated_at ON public.medicamentos;
CREATE TRIGGER trg_medicamentos_updated_at
  BEFORE UPDATE ON public.medicamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.medicamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS medicamentos_select ON public.medicamentos;
CREATE POLICY medicamentos_select ON public.medicamentos
  FOR SELECT USING (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS medicamentos_insert ON public.medicamentos;
CREATE POLICY medicamentos_insert ON public.medicamentos
  FOR INSERT WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS medicamentos_update ON public.medicamentos;
CREATE POLICY medicamentos_update ON public.medicamentos
  FOR UPDATE
  USING (fazenda_id IN (SELECT public.minhas_fazendas()))
  WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

CREATE TABLE IF NOT EXISTS public.medicacao_sessoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fazenda_id uuid NOT NULL REFERENCES public.fazendas (id),
  medicamento_id uuid NOT NULL REFERENCES public.medicamentos (id),
  lote_id uuid NULL REFERENCES public.lotes (id),
  data date NOT NULL DEFAULT public.hoje_fazenda(),
  qtd_aplicados integer NULL,
  observacoes text NULL,
  created_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT medicacao_sessoes_data_passado CHECK (data <= public.hoje_fazenda())
);

CREATE INDEX IF NOT EXISTS idx_medicacao_sessoes_fazenda_data
  ON public.medicacao_sessoes (fazenda_id, data DESC)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_medicacao_sessoes_updated_at ON public.medicacao_sessoes;
CREATE TRIGGER trg_medicacao_sessoes_updated_at
  BEFORE UPDATE ON public.medicacao_sessoes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.medicacao_sessoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS medicacao_sessoes_select ON public.medicacao_sessoes;
CREATE POLICY medicacao_sessoes_select ON public.medicacao_sessoes
  FOR SELECT USING (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS medicacao_sessoes_insert ON public.medicacao_sessoes;
CREATE POLICY medicacao_sessoes_insert ON public.medicacao_sessoes
  FOR INSERT WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS medicacao_sessoes_update ON public.medicacao_sessoes;
CREATE POLICY medicacao_sessoes_update ON public.medicacao_sessoes
  FOR UPDATE
  USING (fazenda_id IN (SELECT public.minhas_fazendas()))
  WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

CREATE TABLE IF NOT EXISTS public.medicacao_aplicacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fazenda_id uuid NOT NULL REFERENCES public.fazendas (id),
  sessao_id uuid NOT NULL REFERENCES public.medicacao_sessoes (id),
  animal_id uuid NOT NULL REFERENCES public.animais (id),
  medicamento_id uuid NOT NULL REFERENCES public.medicamentos (id),
  lote_id uuid NULL REFERENCES public.lotes (id),
  data date NOT NULL DEFAULT public.hoje_fazenda(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT medicacao_aplicacoes_data_passado CHECK (data <= public.hoje_fazenda())
);

CREATE UNIQUE INDEX IF NOT EXISTS medicacao_aplicacoes_animal_medicamento_data
  ON public.medicacao_aplicacoes (animal_id, medicamento_id, data)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_medicacao_aplicacoes_animal
  ON public.medicacao_aplicacoes (fazenda_id, animal_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_medicacao_aplicacoes_sessao
  ON public.medicacao_aplicacoes (sessao_id)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_medicacao_aplicacoes_updated_at ON public.medicacao_aplicacoes;
CREATE TRIGGER trg_medicacao_aplicacoes_updated_at
  BEFORE UPDATE ON public.medicacao_aplicacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.medicacao_aplicacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS medicacao_aplicacoes_select ON public.medicacao_aplicacoes;
CREATE POLICY medicacao_aplicacoes_select ON public.medicacao_aplicacoes
  FOR SELECT USING (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS medicacao_aplicacoes_insert ON public.medicacao_aplicacoes;
CREATE POLICY medicacao_aplicacoes_insert ON public.medicacao_aplicacoes
  FOR INSERT WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS medicacao_aplicacoes_update ON public.medicacao_aplicacoes;
CREATE POLICY medicacao_aplicacoes_update ON public.medicacao_aplicacoes
  FOR UPDATE
  USING (fazenda_id IN (SELECT public.minhas_fazendas()))
  WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

INSERT INTO public.medicamentos (fazenda_id, nome, via)
SELECT f.id, v.nome, v.via
FROM public.fazendas f
CROSS JOIN (
  VALUES
    ('Dectomax', 'injetavel'),
    ('Colosso Pour-on', 'pour_on'),
    ('Fosbion', 'injetavel')
) AS v(nome, via)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.medicamentos m
  WHERE m.fazenda_id = f.id
    AND m.nome = v.nome
    AND m.deleted_at IS NULL
);
