-- Base do módulo Estoque + lançamentos por lote (Alimentação / Sanidade).
-- UI e actions virão nas próximas fatias; schema já alinha custo ao painel de lucratividade.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'categoria_produto') THEN
    CREATE TYPE public.categoria_produto AS ENUM (
      'alimentacao',
      'sanidade',
      'outro'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_movimentacao_estoque') THEN
    CREATE TYPE public.tipo_movimentacao_estoque AS ENUM (
      'entrada',
      'saida',
      'ajuste'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_cotacao') THEN
    CREATE TYPE public.tipo_cotacao AS ENUM (
      'kg_vivo',
      'arroba'
    );
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Produtos (insumos / medicamentos)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fazenda_id uuid NOT NULL REFERENCES public.fazendas (id),
  nome text NOT NULL,
  categoria public.categoria_produto NOT NULL DEFAULT 'alimentacao',
  unidade text NOT NULL DEFAULT 'un',
  estoque_atual numeric(14, 3) NOT NULL DEFAULT 0
    CHECK (estoque_atual >= 0),
  custo_medio numeric(14, 4) NOT NULL DEFAULT 0
    CHECK (custo_medio >= 0),
  ativo boolean NOT NULL DEFAULT true,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz,
  CONSTRAINT produtos_nome_fazenda_unique UNIQUE (fazenda_id, nome)
);

CREATE INDEX IF NOT EXISTS idx_produtos_fazenda
  ON public.produtos (fazenda_id)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_produtos_updated_at ON public.produtos;
CREATE TRIGGER trg_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS produtos_select ON public.produtos;
CREATE POLICY produtos_select ON public.produtos
  FOR SELECT USING (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS produtos_insert ON public.produtos;
CREATE POLICY produtos_insert ON public.produtos
  FOR INSERT WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS produtos_update ON public.produtos;
CREATE POLICY produtos_update ON public.produtos
  FOR UPDATE
  USING (fazenda_id IN (SELECT public.minhas_fazendas()))
  WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

-- ---------------------------------------------------------------------------
-- Movimentações de estoque
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.estoque_movimentacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fazenda_id uuid NOT NULL REFERENCES public.fazendas (id),
  produto_id uuid NOT NULL REFERENCES public.produtos (id),
  tipo public.tipo_movimentacao_estoque NOT NULL,
  quantidade numeric(14, 3) NOT NULL CHECK (quantidade > 0),
  custo_unitario numeric(14, 4) NOT NULL DEFAULT 0 CHECK (custo_unitario >= 0),
  custo_total numeric(14, 2) NOT NULL DEFAULT 0 CHECK (custo_total >= 0),
  data date NOT NULL DEFAULT public.hoje_fazenda(),
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_estoque_mov_produto
  ON public.estoque_movimentacoes (produto_id, data DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_estoque_mov_fazenda
  ON public.estoque_movimentacoes (fazenda_id, data DESC)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_estoque_mov_updated_at ON public.estoque_movimentacoes;
CREATE TRIGGER trg_estoque_mov_updated_at
  BEFORE UPDATE ON public.estoque_movimentacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.estoque_movimentacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS estoque_mov_select ON public.estoque_movimentacoes;
CREATE POLICY estoque_mov_select ON public.estoque_movimentacoes
  FOR SELECT USING (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS estoque_mov_insert ON public.estoque_movimentacoes;
CREATE POLICY estoque_mov_insert ON public.estoque_movimentacoes
  FOR INSERT WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS estoque_mov_update ON public.estoque_movimentacoes;
CREATE POLICY estoque_mov_update ON public.estoque_movimentacoes
  FOR UPDATE
  USING (fazenda_id IN (SELECT public.minhas_fazendas()))
  WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

-- ---------------------------------------------------------------------------
-- Lançamentos de uso no lote (alimentação / sanidade / outro)
-- Baixa de estoque e rateio por cabeça serão feitos nas actions (app).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lancamentos_lote (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fazenda_id uuid NOT NULL REFERENCES public.fazendas (id),
  lote_id uuid NOT NULL REFERENCES public.lotes (id),
  produto_id uuid NOT NULL REFERENCES public.produtos (id),
  categoria public.categoria_produto NOT NULL,
  data_inicio date NOT NULL DEFAULT public.hoje_fazenda(),
  data_fim date,
  quantidade numeric(14, 3) NOT NULL CHECK (quantidade > 0),
  custo_total numeric(14, 2) NOT NULL DEFAULT 0 CHECK (custo_total >= 0),
  qtd_cabecas_snapshot integer NOT NULL CHECK (qtd_cabecas_snapshot > 0),
  custo_por_cabeca numeric(14, 4) GENERATED ALWAYS AS (
    CASE
      WHEN qtd_cabecas_snapshot > 0 THEN custo_total / qtd_cabecas_snapshot
      ELSE 0
    END
  ) STORED,
  estoque_movimentacao_id uuid REFERENCES public.estoque_movimentacoes (id),
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz,
  CONSTRAINT lancamentos_lote_periodo_check CHECK (
    data_fim IS NULL OR data_fim >= data_inicio
  )
);

CREATE INDEX IF NOT EXISTS idx_lancamentos_lote
  ON public.lancamentos_lote (lote_id, data_inicio DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_lancamentos_fazenda
  ON public.lancamentos_lote (fazenda_id, categoria)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_lancamentos_lote_updated_at ON public.lancamentos_lote;
CREATE TRIGGER trg_lancamentos_lote_updated_at
  BEFORE UPDATE ON public.lancamentos_lote
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.lancamentos_lote ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lancamentos_lote_select ON public.lancamentos_lote;
CREATE POLICY lancamentos_lote_select ON public.lancamentos_lote
  FOR SELECT USING (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS lancamentos_lote_insert ON public.lancamentos_lote;
CREATE POLICY lancamentos_lote_insert ON public.lancamentos_lote
  FOR INSERT WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS lancamentos_lote_update ON public.lancamentos_lote;
CREATE POLICY lancamentos_lote_update ON public.lancamentos_lote
  FOR UPDATE
  USING (fazenda_id IN (SELECT public.minhas_fazendas()))
  WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

-- ---------------------------------------------------------------------------
-- Cotações manuais da fazenda (default do preço de referência no painel)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cotacoes_mercado (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fazenda_id uuid NOT NULL REFERENCES public.fazendas (id),
  tipo public.tipo_cotacao NOT NULL,
  valor numeric(14, 4) NOT NULL CHECK (valor >= 0),
  data date NOT NULL DEFAULT public.hoje_fazenda(),
  fonte text NOT NULL DEFAULT 'manual',
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_cotacoes_fazenda_tipo
  ON public.cotacoes_mercado (fazenda_id, tipo, data DESC)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_cotacoes_updated_at ON public.cotacoes_mercado;
CREATE TRIGGER trg_cotacoes_updated_at
  BEFORE UPDATE ON public.cotacoes_mercado
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.cotacoes_mercado ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cotacoes_select ON public.cotacoes_mercado;
CREATE POLICY cotacoes_select ON public.cotacoes_mercado
  FOR SELECT USING (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS cotacoes_insert ON public.cotacoes_mercado;
CREATE POLICY cotacoes_insert ON public.cotacoes_mercado
  FOR INSERT WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

DROP POLICY IF EXISTS cotacoes_update ON public.cotacoes_mercado;
CREATE POLICY cotacoes_update ON public.cotacoes_mercado
  FOR UPDATE
  USING (fazenda_id IN (SELECT public.minhas_fazendas()))
  WITH CHECK (fazenda_id IN (SELECT public.minhas_fazendas()));

-- ---------------------------------------------------------------------------
-- View: custos de insumos por lote (para o agregador de lucratividade)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.vw_custos_lote_insumos
WITH (security_invoker = true)
AS
SELECT
  l.fazenda_id,
  l.lote_id,
  COALESCE(SUM(l.custo_total) FILTER (WHERE l.categoria = 'alimentacao'), 0) AS custo_alimentacao,
  COALESCE(SUM(l.custo_total) FILTER (WHERE l.categoria = 'sanidade'), 0) AS custo_sanidade,
  COALESCE(SUM(l.custo_total) FILTER (WHERE l.categoria = 'outro'), 0) AS custo_outro,
  COALESCE(SUM(l.custo_total), 0) AS custo_insumos_total
FROM public.lancamentos_lote l
WHERE l.deleted_at IS NULL
GROUP BY l.fazenda_id, l.lote_id;

COMMENT ON TABLE public.produtos IS
  'Insumos e medicamentos. estoque_atual/custo_medio atualizados pelas movimentações (app).';
COMMENT ON TABLE public.estoque_movimentacoes IS
  'Entradas (compra), saídas (uso no lote) e ajustes. quantidade sempre positiva.';
COMMENT ON TABLE public.lancamentos_lote IS
  'Uso de produto no lote por período. Rateio: custo_total / qtd_cabecas_snapshot.';
COMMENT ON TABLE public.cotacoes_mercado IS
  'Histórico de preços de referência (kg vivo ou @) para o painel de lucratividade.';
