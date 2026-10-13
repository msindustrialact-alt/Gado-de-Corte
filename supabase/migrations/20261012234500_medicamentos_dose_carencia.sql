-- Dose e carência no cadastro, copiadas no manejo para o histórico não mudar depois.

DO $$
DECLARE
  nome text;
BEGIN
  SELECT con.conname INTO nome
  FROM pg_constraint AS con
  WHERE con.conrelid = 'public.medicamentos'::regclass
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) ILIKE '%via%';

  IF nome IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.medicamentos DROP CONSTRAINT %I', nome);
  END IF;
END $$;

ALTER TABLE public.medicamentos
  ADD CONSTRAINT medicamentos_via_check
  CHECK (via IN ('injetavel', 'pour_on', 'oral'));

ALTER TABLE public.medicamentos
  ADD COLUMN IF NOT EXISTS dose text;

ALTER TABLE public.medicamentos
  ADD COLUMN IF NOT EXISTS carencia_dias integer;

ALTER TABLE public.medicamentos
  DROP CONSTRAINT IF EXISTS medicamentos_carencia_dias_check;

ALTER TABLE public.medicamentos
  ADD CONSTRAINT medicamentos_carencia_dias_check
  CHECK (carencia_dias IS NULL OR carencia_dias >= 0);

ALTER TABLE public.medicacao_sessoes
  ADD COLUMN IF NOT EXISTS dose text;

ALTER TABLE public.medicacao_sessoes
  ADD COLUMN IF NOT EXISTS carencia_dias integer;

ALTER TABLE public.medicacao_sessoes
  DROP CONSTRAINT IF EXISTS medicacao_sessoes_carencia_dias_check;

ALTER TABLE public.medicacao_sessoes
  ADD CONSTRAINT medicacao_sessoes_carencia_dias_check
  CHECK (carencia_dias IS NULL OR carencia_dias >= 0);

ALTER TABLE public.medicacao_aplicacoes
  ADD COLUMN IF NOT EXISTS dose text;

ALTER TABLE public.medicacao_aplicacoes
  ADD COLUMN IF NOT EXISTS carencia_dias integer;

ALTER TABLE public.medicacao_aplicacoes
  DROP CONSTRAINT IF EXISTS medicacao_aplicacoes_carencia_dias_check;

ALTER TABLE public.medicacao_aplicacoes
  ADD CONSTRAINT medicacao_aplicacoes_carencia_dias_check
  CHECK (carencia_dias IS NULL OR carencia_dias >= 0);
