export type IconeNav =
  | "inicio"
  | "animais"
  | "lotes"
  | "pesagens"
  | "sanidade"
  | "reproducao"
  | "manejo"
  | "pastagens"
  | "confinamento"
  | "alimentacao"
  | "financeiro"
  | "estoque"
  | "relatorios"
  | "cadastros"
  | "configuracoes";

export type FilhoNav = {
  titulo: string;
  href: string;
};

export type ItemNav = {
  titulo: string;
  href: string;
  icone: IconeNav;
  filhos?: FilhoNav[];
};

export const ITENS_NAV: ItemNav[] = [
  { titulo: "Início", href: "/dashboard", icone: "inicio" },
  { titulo: "Animais", href: "/animais", icone: "animais" },
  { titulo: "Lotes", href: "/lotes", icone: "lotes" },
  { titulo: "Pesagens", href: "/pesagens", icone: "pesagens" },
  {
    titulo: "Sanidade",
    href: "/sanidade",
    icone: "sanidade",
    filhos: [
      { titulo: "Vacinas", href: "/sanidade/vacinas" },
      { titulo: "Medicações", href: "/sanidade/medicacoes" },
      { titulo: "Tratamentos", href: "/sanidade/tratamentos" },
    ],
  },
  { titulo: "Reprodução", href: "/reproducao", icone: "reproducao" },
  { titulo: "Manejo", href: "/manejo", icone: "manejo" },
  { titulo: "Pastagens", href: "/pastagens", icone: "pastagens" },
  { titulo: "Confinamento", href: "/confinamento", icone: "confinamento" },
  { titulo: "Alimentação", href: "/alimentacao", icone: "alimentacao" },
  {
    titulo: "Financeiro",
    href: "/financeiro",
    icone: "financeiro",
    filhos: [
      { titulo: "Receitas", href: "/financeiro/receitas" },
      { titulo: "Despesas", href: "/financeiro/despesas" },
    ],
  },
  { titulo: "Estoque", href: "/estoque", icone: "estoque" },
  {
    titulo: "Relatórios",
    href: "/relatorios",
    icone: "relatorios",
    filhos: [
      { titulo: "Rebanho", href: "/relatorios/rebanho" },
      { titulo: "Desempenho", href: "/relatorios/desempenho" },
    ],
  },
  {
    titulo: "Cadastros",
    href: "/cadastros",
    icone: "cadastros",
    filhos: [
      { titulo: "Raças", href: "/cadastros/racas" },
      { titulo: "Lotes", href: "/lotes" },
      { titulo: "Piquetes", href: "/pastagens" },
      { titulo: "Fornecedores", href: "/cadastros/fornecedores" },
    ],
  },
  { titulo: "Configurações", href: "/configuracoes", icone: "configuracoes" },
];

const ROTAS_EXTRA: FilhoNav[] = [{ titulo: "Meu perfil", href: "/perfil" }];

export function tituloDaRota(pathname: string): string | null {
  for (const extra of ROTAS_EXTRA) {
    if (extra.href === pathname) {
      return extra.titulo;
    }
  }

  for (const item of ITENS_NAV) {
    if (item.href === pathname) {
      return item.titulo;
    }

    const filho = item.filhos?.find((entrada) => entrada.href === pathname);
    if (filho) {
      return filho.titulo;
    }
  }

  return null;
}

export function rotaEstaAtiva(href: string, pathname: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
