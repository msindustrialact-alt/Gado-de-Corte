-- Corrige vw_pesagens_resumo para avaliar RLS do usuário autenticado
-- (security_invoker), alinhada a vw_lotes_resumo e vw_piquetes_resumo.

ALTER VIEW public.vw_pesagens_resumo SET (security_invoker = true);
