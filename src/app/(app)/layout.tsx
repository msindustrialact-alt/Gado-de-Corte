import { AppShell } from "@/components/layout/app-shell";
import { getFazendaAtiva } from "@/lib/fazenda";
import { lerFazendaPainelAtual } from "@/lib/fazenda-painel-servidor";
import { createClient } from "@/lib/supabase/server";
import {
  avatarDoUsuario,
  iniciaisDoNome,
  nomeDoUsuario,
  rotuloPapel,
} from "@/lib/usuario";

export default async function LayoutApp({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [fazenda, fazendaPainel] = await Promise.all([
    getFazendaAtiva(),
    lerFazendaPainelAtual(undefined),
  ]);

  const nome = user ? nomeDoUsuario(user) : "Usuário";

  return (
    <AppShell
      fazenda={fazendaPainel}
      usuario={{
        nome,
        iniciais: iniciaisDoNome(nome),
        papel: rotuloPapel(fazenda?.papel),
        avatarUrl: user ? avatarDoUsuario(user) : null,
      }}
    >
      {children}
    </AppShell>
  );
}
