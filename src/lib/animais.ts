import { differenceInMonths } from "date-fns";

import { formatarDecimal, formatarInteiro } from "@/lib/formatacao";
import type { Enums } from "@/types/database";

export const ITENS_POR_PAGINA = 25;

export type StatusAnimal = Enums<"status_animal">;
export type SexoAnimal = Enums<"sexo_animal">;
export type CategoriaAnimal = Enums<"categoria_animal">;
export type FaseProdutiva = Enums<"fase_produtiva">;
export type TipoChifre = Enums<"tipo_chifre">;
export type OrigemAnimal = Enums<"origem_animal">;
export type MotivoSaida = Enums<"motivo_saida">;
export type PropriedadeAnimal = Enums<"propriedade_animal">;

export type OrdemAnimais = "brinco" | "idade" | "peso";
export type DirecaoOrdem = "asc" | "desc";

export type RelacionadoAnimal = {
  id: string;
  nome: string;
};

export type ParenteAnimal = {
  id: string;
  brinco: string;
  nome: string | null;
  deleted_at: string | null;
};

export type AnimalListagem = {
  id: string;
  brinco: string;
  nome: string | null;
  sexo: SexoAnimal;
  categoria: CategoriaAnimal | null;
  data_nascimento: string | null;
  nascimento_estimado: boolean;
  peso_atual: number | null;
  status: StatusAnimal;
  foto_url: string | null;
  propriedade: PropriedadeAnimal;
  raca: RelacionadoAnimal | null;
  lote: RelacionadoAnimal | null;
  piquete: RelacionadoAnimal | null;
};

export type AnimalDetalhe = AnimalListagem & {
  brinco_eletronico: string | null;
  sisbov: string | null;
  composicao_racial: string | null;
  pelagem: string | null;
  tipo_chifre: TipoChifre | null;
  origem: OrigemAnimal;
  fornecedor: string | null;
  data_entrada: string | null;
  peso_entrada: number | null;
  valor_aquisicao: number | null;
  pai: ParenteAnimal | null;
  mae: ParenteAnimal | null;
  fase_produtiva: FaseProdutiva | null;
  data_ultima_pesagem: string | null;
  escore_corporal: number | null;
  data_saida: string | null;
  motivo_saida: MotivoSaida | null;
  destino: string | null;
  peso_saida: number | null;
  valor_venda: number | null;
  observacoes: string | null;
};

export type FiltrosAnimais = {
  q: string;
  status: "todos" | StatusAnimal;
  sexo: "todos" | SexoAnimal;
  categoria: "todos" | CategoriaAnimal;
  racaId: string;
  loteId: string;
  piqueteId: string;
  propriedade: "todas" | PropriedadeAnimal;
  ordem: OrdemAnimais;
  direcao: DirecaoOrdem;
  pagina: number;
};

export type OpcaoFiltro = {
  valor: string;
  rotulo: string;
};

export const STATUS_VALIDOS: StatusAnimal[] = [
  "ativo",
  "vendido",
  "abatido",
  "morto",
  "transferido",
];

export const SEXOS_VALIDOS: SexoAnimal[] = ["macho", "femea"];

export const CATEGORIAS_VALIDAS: CategoriaAnimal[] = [
  "bezerro",
  "bezerra",
  "garrote",
  "novilha",
  "boi",
  "vaca",
  "touro",
];

export const FASES_VALIDAS: FaseProdutiva[] = ["cria", "recria", "engorda"];

export const CHIFRES_VALIDOS: TipoChifre[] = ["mocho", "chifrudo", "descornado"];

export const PROPRIEDADES_VALIDAS: PropriedadeAnimal[] = ["joana", "catagua"];

export const MOTIVOS_SAIDA_VALIDOS: MotivoSaida[] = [
  "venda",
  "abate",
  "morte",
  "descarte",
  "transferencia",
];

const ORDENS_VALIDAS: OrdemAnimais[] = ["brinco", "idade", "peso"];

export const FILTROS_PADRAO: FiltrosAnimais = {
  q: "",
  status: "ativo",
  sexo: "todos",
  categoria: "todos",
  racaId: "",
  loteId: "",
  piqueteId: "",
  propriedade: "todas",
  ordem: "brinco",
  direcao: "asc",
  pagina: 1,
};

export const LABELS_STATUS: Record<StatusAnimal, string> = {
  ativo: "Ativo",
  vendido: "Vendido",
  abatido: "Abatido",
  morto: "Morto",
  transferido: "Transferido",
};

export const LABELS_SEXO: Record<SexoAnimal, string> = {
  macho: "Macho",
  femea: "Fêmea",
};

export const LABELS_CATEGORIA: Record<CategoriaAnimal, string> = {
  bezerro: "Bezerro",
  bezerra: "Bezerra",
  garrote: "Garrote",
  novilha: "Novilha",
  boi: "Boi",
  vaca: "Vaca",
  touro: "Touro",
};

export const LABELS_FASE: Record<FaseProdutiva, string> = {
  cria: "Cria",
  recria: "Recria",
  engorda: "Engorda",
};

export const LABELS_CHIFRE: Record<TipoChifre, string> = {
  mocho: "Mocho",
  chifrudo: "Chifrudo",
  descornado: "Descornado",
};

export const LABELS_ORIGEM: Record<OrigemAnimal, string> = {
  nascido_fazenda: "Nascido na fazenda",
  comprado: "Comprado",
};

export const LABELS_PROPRIEDADE: Record<PropriedadeAnimal, string> = {
  joana: "Fazenda Joana",
  catagua: "Fazenda Cataguá",
};

export const LABELS_MOTIVO_SAIDA: Record<MotivoSaida, string> = {
  venda: "Venda",
  abate: "Abate",
  morte: "Morte",
  descarte: "Descarte",
  transferencia: "Transferência",
};

export const OPCOES_STATUS: OpcaoFiltro[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "ativo", rotulo: "Ativo" },
  { valor: "vendido", rotulo: "Vendido" },
  { valor: "abatido", rotulo: "Abatido" },
  { valor: "morto", rotulo: "Morto" },
  { valor: "transferido", rotulo: "Transferido" },
];

export const OPCOES_SEXO: OpcaoFiltro[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "macho", rotulo: "Macho" },
  { valor: "femea", rotulo: "Fêmea" },
];

export const OPCOES_CATEGORIA: OpcaoFiltro[] = [
  { valor: "todos", rotulo: "Todas" },
  ...CATEGORIAS_VALIDAS.map((valor) => ({
    valor,
    rotulo: LABELS_CATEGORIA[valor],
  })),
];

export const OPCOES_PROPRIEDADE: OpcaoFiltro[] = [
  { valor: "todas", rotulo: "Todas" },
  ...PROPRIEDADES_VALIDAS.map((valor) => ({
    valor,
    rotulo: LABELS_PROPRIEDADE[valor],
  })),
];

function primeiro(
  valor: string | string[] | undefined,
): string {
  if (Array.isArray(valor)) {
    return valor[0] ?? "";
  }

  return valor ?? "";
}

function incluir<T extends string>(valor: string, lista: readonly T[]): T | null {
  return lista.includes(valor as T) ? (valor as T) : null;
}

export function sanitizarBusca(texto: string): string {
  return texto
    .replace(/[%_\\,()'"<>;]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export function formatIdade(
  dataNascimento: string | null | undefined,
  nascimentoEstimado = false,
): string {
  if (!dataNascimento) {
    return "—";
  }

  const nascimento = new Date(`${dataNascimento}T00:00:00`);

  if (Number.isNaN(nascimento.getTime())) {
    return "—";
  }

  const meses = Math.max(0, differenceInMonths(new Date(), nascimento));
  let texto: string;

  if (meses < 24) {
    texto = meses === 1 ? "1 mês" : `${meses} meses`;
  } else {
    const anos = Math.floor(meses / 12);
    const resto = meses % 12;
    const parteAnos = anos === 1 ? "1 ano" : `${anos} anos`;
    texto =
      resto === 0
        ? parteAnos
        : `${parteAnos} e ${resto === 1 ? "1 mês" : `${resto} meses`}`;
  }

  return nascimentoEstimado ? `~${texto}` : texto;
}

export function formatPeso(peso: number | string | null | undefined): string {
  if (peso == null || peso === "") {
    return "—";
  }

  const numero = typeof peso === "string" ? Number(peso) : peso;

  if (!Number.isFinite(numero)) {
    return "—";
  }

  const inteiro = Math.abs(numero - Math.round(numero)) < 0.005;
  const texto = inteiro
    ? formatarInteiro(Math.round(numero))
    : formatarDecimal(numero, 1);

  return `${texto} kg`;
}

export function textoOuTraco(valor: string | number | null | undefined): string {
  if (valor == null) {
    return "—";
  }

  const texto = String(valor).trim();
  return texto.length > 0 ? texto : "—";
}

export function lerFiltrosAnimais(
  searchParams: Record<string, string | string[] | undefined>,
): FiltrosAnimais {
  const q = sanitizarBusca(primeiro(searchParams.q));
  const statusParam = primeiro(searchParams.status);
  const sexoParam = primeiro(searchParams.sexo);
  const categoriaParam = primeiro(searchParams.categoria);
  const ordemParam = primeiro(searchParams.ordem);
  const dirParam = primeiro(searchParams.dir);
  const paginaBruta = Number.parseInt(primeiro(searchParams.pagina), 10);

  return {
    q,
    status:
      statusParam === "todos"
        ? "todos"
        : (incluir(statusParam, STATUS_VALIDOS) ?? "ativo"),
    sexo: incluir(sexoParam, SEXOS_VALIDOS) ?? "todos",
    categoria: incluir(categoriaParam, CATEGORIAS_VALIDAS) ?? "todos",
    racaId: primeiro(searchParams.raca),
    loteId: primeiro(searchParams.lote),
    piqueteId: primeiro(searchParams.piquete),
    propriedade: incluir(primeiro(searchParams.fazenda), PROPRIEDADES_VALIDAS) ?? "todas",
    ordem: incluir(ordemParam, ORDENS_VALIDAS) ?? "brinco",
    direcao: dirParam === "desc" ? "desc" : "asc",
    pagina: Number.isFinite(paginaBruta) && paginaBruta > 0 ? paginaBruta : 1,
  };
}

export function urlAnimais(
  filtros: FiltrosAnimais,
  patch: Partial<FiltrosAnimais> = {},
  caminho = "/animais",
): string {
  const proximo: FiltrosAnimais = {
    ...filtros,
    ...patch,
    pagina: patch.pagina ?? (Object.keys(patch).length > 0 ? 1 : filtros.pagina),
  };

  if (patch.pagina != null) {
    proximo.pagina = Math.max(1, patch.pagina);
  }

  const params = new URLSearchParams();

  if (proximo.q) {
    params.set("q", proximo.q);
  }

  if (proximo.status !== "ativo") {
    params.set("status", proximo.status);
  }

  if (proximo.sexo !== "todos") {
    params.set("sexo", proximo.sexo);
  }

  if (proximo.categoria !== "todos") {
    params.set("categoria", proximo.categoria);
  }

  if (proximo.racaId) {
    params.set("raca", proximo.racaId);
  }

  if (proximo.loteId) {
    params.set("lote", proximo.loteId);
  }

  if (proximo.piqueteId) {
    params.set("piquete", proximo.piqueteId);
  }

  if (proximo.propriedade !== "todas") {
    params.set("fazenda", proximo.propriedade);
  }

  if (proximo.ordem !== "brinco") {
    params.set("ordem", proximo.ordem);
  }

  if (proximo.direcao !== "asc") {
    params.set("dir", proximo.direcao);
  }

  if (proximo.pagina > 1) {
    params.set("pagina", String(proximo.pagina));
  }

  const qs = params.toString();
  return qs ? `${caminho}?${qs}` : caminho;
}

export function temFiltrosAtivos(filtros: FiltrosAnimais): boolean {
  return (
    filtros.q !== "" ||
    filtros.status !== "ativo" ||
    filtros.sexo !== "todos" ||
    filtros.categoria !== "todos" ||
    filtros.racaId !== "" ||
    filtros.loteId !== "" ||
    filtros.piqueteId !== "" ||
    filtros.propriedade !== "todas"
  );
}

export const OPCOES_STATUS_FORM: OpcaoFiltro[] = STATUS_VALIDOS.map((valor) => ({
  valor,
  rotulo: LABELS_STATUS[valor],
}));

export const OPCOES_CATEGORIA_FORM: OpcaoFiltro[] = CATEGORIAS_VALIDAS.map(
  (valor) => ({ valor, rotulo: LABELS_CATEGORIA[valor] }),
);

export const OPCOES_FASE_FORM: OpcaoFiltro[] = FASES_VALIDAS.map((valor) => ({
  valor,
  rotulo: LABELS_FASE[valor],
}));

export const OPCOES_CHIFRE_FORM: OpcaoFiltro[] = CHIFRES_VALIDOS.map((valor) => ({
  valor,
  rotulo: LABELS_CHIFRE[valor],
}));

export const OPCOES_MOTIVO_FORM: OpcaoFiltro[] = MOTIVOS_SAIDA_VALIDOS.map(
  (valor) => ({ valor, rotulo: LABELS_MOTIVO_SAIDA[valor] }),
);

export const OPCOES_PROPRIEDADE_FORM: { valor: PropriedadeAnimal; rotulo: string }[] =
  PROPRIEDADES_VALIDAS.map((valor) => ({
    valor,
    rotulo: LABELS_PROPRIEDADE[valor],
  }));

export function parseNumeroPt(valor: string | number | null | undefined): number | null {
  if (valor == null || valor === "") {
    return null;
  }

  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : null;
  }

  const texto = valor.trim();

  if (!texto) {
    return null;
  }

  const normalizado = texto.includes(",")
    ? texto.replace(/\./g, "").replace(",", ".")
    : texto.replace(",", ".");
  const numero = Number(normalizado);

  return Number.isFinite(numero) ? numero : null;
}

/** Data civil no fuso America/Sao_Paulo (alinhado a public.hoje_fazenda()). */
export function hojeISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function mesesDeIdade(dataNascimento: string): number | null {
  const nascimento = new Date(`${dataNascimento}T00:00:00`);

  if (Number.isNaN(nascimento.getTime())) {
    return null;
  }

  return Math.max(0, differenceInMonths(new Date(), nascimento));
}

export function sugerirCategoria(
  sexo: SexoAnimal | "" | null | undefined,
  dataNascimento: string | null | undefined,
): CategoriaAnimal | null {
  if (!sexo || !dataNascimento) {
    return null;
  }

  const meses = mesesDeIdade(dataNascimento);

  if (meses == null) {
    return null;
  }

  if (sexo === "macho") {
    if (meses < 8) return "bezerro";
    if (meses <= 24) return "garrote";
    return "boi";
  }

  if (meses < 8) return "bezerra";
  if (meses <= 24) return "novilha";
  return "vaca";
}

export function sugerirFase(
  dataNascimento: string | null | undefined,
): FaseProdutiva | null {
  if (!dataNascimento) {
    return null;
  }

  const meses = mesesDeIdade(dataNascimento);

  if (meses == null) {
    return null;
  }

  if (meses <= 8) return "cria";
  if (meses <= 24) return "recria";
  return "engorda";
}

export function motivoPorStatus(status: StatusAnimal): MotivoSaida | null {
  if (status === "vendido") return "venda";
  if (status === "abatido") return "abate";
  if (status === "morto") return "morte";
  if (status === "transferido") return "transferencia";
  return null;
}

export function rotuloParente(animal: {
  brinco: string;
  nome: string | null;
  raca?: string | null;
}): string {
  const partes = [animal.brinco];

  if (animal.nome) {
    partes.push(animal.nome);
  }

  if (animal.raca) {
    partes.push(animal.raca);
  }

  return partes.join(" · ");
}
