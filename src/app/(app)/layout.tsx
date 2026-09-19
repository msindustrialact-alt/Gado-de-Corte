import { AppShell } from "@/components/layout/app-shell";
import { getFazendaAtiva } from "@/lib/fazenda";
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
  const fazenda = await getFazendaAtiva();

  const nome = user ? nomeDoUsuario(user) : "Usuário";

  return (
    <AppShell
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
