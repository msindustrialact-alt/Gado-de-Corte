import { getFazendaAtiva } from "@/lib/fazenda";
import { createClient } from "@/lib/supabase/server";
import {
  ITENS_POR_PAGINA,
  rotuloParente,
  sanitizarBusca,
  type AnimalDetalhe,
  type AnimalListagem,
  type FiltrosAnimais,
  type OpcaoFiltro,
  type ParenteAnimal,
  type RelacionadoAnimal,
} from "@/lib/animais";

const COLUNAS_LISTA = `
  id,
  brinco,
  nome,
  sexo,
  categoria,
  data_nascimento,
  nascimento_estimado,
  peso_atual,
  status,
  foto_url,
  propriedade,
  raca:racas ( id, nome ),
  lote:lotes!fk_animais_lote ( id, nome ),
  piquete:piquetes!fk_animais_piquete ( id, nome )
`;

const COLUNAS_DETALHE = `
  id,
  brinco,
  nome,
  sexo,
  categoria,
  data_nascimento,
  nascimento_estimado,
  peso_atual,
  status,
  foto_url,
  propriedade,
  brinco_eletronico,
  sisbov,
  composicao_racial,
  pelagem,
  tipo_chifre,
  origem,
  fornecedor,
  data_entrada,
  peso_entrada,
  valor_aquisicao,
  fase_produtiva,
  data_ultima_pesagem,
  escore_corporal,
  data_saida,
  motivo_saida,
  destino,
  peso_saida,
  valor_venda,
  observacoes,
  raca:racas ( id, nome ),
  lote:lotes!fk_animais_lote ( id, nome ),
  piquete:piquetes!fk_animais_piquete ( id, nome ),
  pai:animais!pai_id ( id, brinco, nome, deleted_at ),
  mae:animais!mae_id ( id, brinco, nome, deleted_at )
`;

type RelacionadoBanco = RelacionadoAnimal | RelacionadoAnimal[] | null;
type ParenteBanco = ParenteAnimal | ParenteAnimal[] | null;

function um<T>(valor: T | T[] | null | undefined): T | null {
  if (!valor) {
    return null;
  }

  return Array.isArray(valor) ? (valor[0] ?? null) : valor;
}

function colunaOrdem(ordem: FiltrosAnimais["ordem"]): string {
  if (ordem === "idade") {
    return "data_nascimento";
  }

  if (ordem === "peso") {
    return "peso_atual";
  }

  return "brinco";
}

export type OpcoesFiltroAnimais = {
  racas: OpcaoFiltro[];
  lotes: OpcaoFiltro[];
  piquetes: OpcaoFiltro[];
};

export type ResultadoListaAnimais = {
  animais: AnimalListagem[];
  totalFiltrado: number;
  totalCadastrados: number;
  pagina: number;
  de: number;
  ate: number;
};

function mapearListagem(linha: {
  id: string;
  brinco: string;
  nome: string | null;
  sexo: AnimalListagem["sexo"];
  categoria: AnimalListagem["categoria"];
  data_nascimento: string | null;
  nascimento_estimado: boolean;
  peso_atual: number | null;
  status: AnimalListagem["status"];
  foto_url: string | null;
  propriedade: AnimalListagem["propriedade"];
  raca: RelacionadoBanco;
  lote: RelacionadoBanco;
  piquete: RelacionadoBanco;
}): AnimalListagem {
  return {
    id: linha.id,
    brinco: linha.brinco,
    nome: linha.nome,
    sexo: linha.sexo,
    categoria: linha.categoria,
    data_nascimento: linha.data_nascimento,
    nascimento_estimado: linha.nascimento_estimado,
    peso_atual: linha.peso_atual,
    status: linha.status,
    foto_url: linha.foto_url,
    propriedade: linha.propriedade,
    raca: um(linha.raca),
    lote: um(linha.lote),
    piquete: um(linha.piquete),
  };
}

export async function getOpcoesFiltroAnimais(atuais?: {
  racaId?: string | null;
  loteId?: string | null;
  piqueteId?: string | null;
}): Promise<OpcoesFiltroAnimais> {
  const fazenda = await getFazendaAtiva();
  const vazio: OpcoesFiltroAnimais = { racas: [], lotes: [], piquetes: [] };

  if (!fazenda) {
    return vazio;
  }

  const supabase = await createClient();

  const [racas, lotes, piquetes] = await Promise.all([
    supabase
      .from("racas")
      .select("id, nome")
      .eq("ativa", true)
      .or(`fazenda_id.is.null,fazenda_id.eq.${fazenda.id}`)
      .order("nome", { ascending: true }),
    supabase
      .from("lotes")
      .select("id, nome")
      .eq("fazenda_id", fazenda.id)
      .eq("status", "ativo")
      .is("deleted_at", null)
      .order("nome", { ascending: true }),
    supabase
      .from("piquetes")
      .select("id, nome")
      .eq("fazenda_id", fazenda.id)
      .in("status", ["ativo", "em_descanso"])
      .is("deleted_at", null)
      .order("nome", { ascending: true }),
  ]);

  const listaRacas = [...(racas.data ?? [])];
  const listaLotes = [...(lotes.data ?? [])];
  const listaPiquetes = [...(piquetes.data ?? [])];

  async function garantir(
    lista: { id: string; nome: string }[],
    id: string | null | undefined,
    tabela: "racas" | "lotes" | "piquetes",
  ) {
    if (!id || lista.some((item) => item.id === id)) {
      return;
    }

    const { data } = await supabase
      .from(tabela)
      .select("id, nome")
      .eq("id", id)
      .maybeSingle();

    if (data) {
      lista.push(data);
      lista.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    }
  }

  await Promise.all([
    garantir(listaRacas, atuais?.racaId, "racas"),
    garantir(listaLotes, atuais?.loteId, "lotes"),
    garantir(listaPiquetes, atuais?.piqueteId, "piquetes"),
  ]);

  return {
    racas: listaRacas.map((item) => ({
      valor: item.id,
      rotulo: item.nome,
    })),
    lotes: listaLotes.map((item) => ({
      valor: item.id,
      rotulo: item.nome,
    })),
    piquetes: listaPiquetes.map((item) => ({
      valor: item.id,
      rotulo: item.nome,
    })),
  };
}

export async function getListaAnimais(
  filtros: FiltrosAnimais,
): Promise<ResultadoListaAnimais> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    throw new Error("Não foi possível identificar a fazenda ativa.");
  }

  const supabase = await createClient();
  const busca = sanitizarBusca(filtros.q);
  const de = (filtros.pagina - 1) * ITENS_POR_PAGINA;
  const ate = de + ITENS_POR_PAGINA - 1;

  let consulta = supabase
    .from("animais")
    .select(COLUNAS_LISTA, { count: "exact" })
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null);

  if (filtros.status !== "todos") {
    consulta = consulta.eq("status", filtros.status);
  }

  if (filtros.sexo !== "todos") {
    consulta = consulta.eq("sexo", filtros.sexo);
  }

  if (filtros.categoria !== "todos") {
    consulta = consulta.eq("categoria", filtros.categoria);
  }

  if (filtros.racaId) {
    consulta = consulta.eq("raca_id", filtros.racaId);
  }

  if (filtros.loteId) {
    consulta = consulta.eq("lote_id", filtros.loteId);
  }

  if (filtros.piqueteId) {
    consulta = consulta.eq("piquete_id", filtros.piqueteId);
  }

  if (filtros.propriedade !== "todas") {
    consulta = consulta.eq("propriedade", filtros.propriedade);
  }

  if (busca) {
    const { data: lotesEncontrados } = await supabase
      .from("lotes")
      .select("id")
      .eq("fazenda_id", fazenda.id)
      .is("deleted_at", null)
      .ilike("nome", `%${busca}%`);

    const idsLote = (lotesEncontrados ?? [])
      .map((lote) => lote.id)
      .filter(Boolean);

    const partes = [
      `brinco.ilike.%${busca}%`,
      `nome.ilike.%${busca}%`,
      `brinco_eletronico.ilike.%${busca}%`,
      `sisbov.ilike.%${busca}%`,
    ];

    if (idsLote.length > 0) {
      partes.push(`lote_id.in.(${idsLote.join(",")})`);
    }

    consulta = consulta.or(partes.join(","));
  }

  const [{ data, error, count }, cadastrados] = await Promise.all([
    consulta
      .order(colunaOrdem(filtros.ordem), {
        ascending: filtros.direcao === "asc",
        nullsFirst: false,
      })
      .order("brinco", { ascending: true })
      .range(de, ate),
    supabase
      .from("animais")
      .select("id", { count: "exact", head: true })
      .eq("fazenda_id", fazenda.id)
      .is("deleted_at", null),
  ]);

  if (error) {
    console.error(error);
    throw new Error("Não foi possível carregar os animais.");
  }

  const totalFiltrado = count ?? 0;
  const totalCadastrados = cadastrados.count ?? 0;
  const animais = (data ?? []).map((linha) =>
    mapearListagem(linha as Parameters<typeof mapearListagem>[0]),
  );

  return {
    animais,
    totalFiltrado,
    totalCadastrados,
    pagina: filtros.pagina,
    de: totalFiltrado === 0 ? 0 : de + 1,
    ate: Math.min(ate + 1, totalFiltrado),
  };
}

export async function getIdsAnimaisFiltrados(
  filtros: FiltrosAnimais,
): Promise<string[]> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return [];
  }

  const supabase = await createClient();
  const busca = sanitizarBusca(filtros.q);

  let consulta = supabase
    .from("animais")
    .select("id")
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null);

  if (filtros.status !== "todos") {
    consulta = consulta.eq("status", filtros.status);
  }

  if (filtros.sexo !== "todos") {
    consulta = consulta.eq("sexo", filtros.sexo);
  }

  if (filtros.categoria !== "todos") {
    consulta = consulta.eq("categoria", filtros.categoria);
  }

  if (filtros.racaId) {
    consulta = consulta.eq("raca_id", filtros.racaId);
  }

  if (filtros.loteId) {
    consulta = consulta.eq("lote_id", filtros.loteId);
  }

  if (filtros.piqueteId) {
    consulta = consulta.eq("piquete_id", filtros.piqueteId);
  }

  if (filtros.propriedade !== "todas") {
    consulta = consulta.eq("propriedade", filtros.propriedade);
  }

  if (busca) {
    const { data: lotesEncontrados } = await supabase
      .from("lotes")
      .select("id")
      .eq("fazenda_id", fazenda.id)
      .is("deleted_at", null)
      .ilike("nome", `%${busca}%`);

    const idsLote = (lotesEncontrados ?? [])
      .map((lote) => lote.id)
      .filter(Boolean);

    const partes = [
      `brinco.ilike.%${busca}%`,
      `nome.ilike.%${busca}%`,
      `brinco_eletronico.ilike.%${busca}%`,
      `sisbov.ilike.%${busca}%`,
    ];

    if (idsLote.length > 0) {
      partes.push(`lote_id.in.(${idsLote.join(",")})`);
    }

    consulta = consulta.or(partes.join(","));
  }

  const { data, error } = await consulta.order("brinco", { ascending: true });

  if (error) {
    console.error(error);
    throw new Error("Não foi possível carregar os animais do filtro.");
  }

  return (data ?? []).map((linha) => linha.id);
}

export async function buscarParentes(params: {
  q: string;
  sexo: "macho" | "femea";
  excluirId?: string;
}): Promise<{ id: string; rotulo: string }[]> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return [];
  }

  const busca = sanitizarBusca(params.q);
  const supabase = await createClient();

  let consulta = supabase
    .from("animais")
    .select("id, brinco, nome, raca:racas ( nome )")
    .eq("fazenda_id", fazenda.id)
    .eq("sexo", params.sexo)
    .is("deleted_at", null)
    .order("brinco", { ascending: true })
    .limit(10);

  if (params.excluirId) {
    consulta = consulta.neq("id", params.excluirId);
  }

  if (busca) {
    consulta = consulta.or(`brinco.ilike.%${busca}%,nome.ilike.%${busca}%`);
  }

  const { data, error } = await consulta;

  if (error || !data) {
    return [];
  }

  return data.map((item) => {
    const raca = Array.isArray(item.raca) ? item.raca[0] : item.raca;

    return {
      id: item.id,
      rotulo: rotuloParente({
        brinco: item.brinco,
        nome: item.nome,
        raca: raca?.nome ?? null,
      }),
    };
  });
}

export async function getAnimalPorId(id: string): Promise<AnimalDetalhe | null> {
  const fazenda = await getFazendaAtiva();

  if (!fazenda) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("animais")
    .select(COLUNAS_DETALHE)
    .eq("id", id)
    .eq("fazenda_id", fazenda.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  if (!data) {
    return null;
  }

  const linha = data as Parameters<typeof mapearListagem>[0] & {
    brinco_eletronico: string | null;
    sisbov: string | null;
    composicao_racial: string | null;
    pelagem: string | null;
    tipo_chifre: AnimalDetalhe["tipo_chifre"];
    origem: AnimalDetalhe["origem"];
    fornecedor: string | null;
    data_entrada: string | null;
    peso_entrada: number | null;
    valor_aquisicao: number | null;
    fase_produtiva: AnimalDetalhe["fase_produtiva"];
    data_ultima_pesagem: string | null;
    escore_corporal: number | null;
    data_saida: string | null;
    motivo_saida: AnimalDetalhe["motivo_saida"];
    destino: string | null;
    peso_saida: number | null;
    valor_venda: number | null;
    observacoes: string | null;
    pai: ParenteBanco;
    mae: ParenteBanco;
  };

  return {
    ...mapearListagem(linha),
    brinco_eletronico: linha.brinco_eletronico,
    sisbov: linha.sisbov,
    composicao_racial: linha.composicao_racial,
    pelagem: linha.pelagem,
    tipo_chifre: linha.tipo_chifre,
    origem: linha.origem,
    fornecedor: linha.fornecedor,
    data_entrada: linha.data_entrada,
    peso_entrada: linha.peso_entrada,
    valor_aquisicao: linha.valor_aquisicao,
    pai: um(linha.pai),
    mae: um(linha.mae),
    fase_produtiva: linha.fase_produtiva,
    data_ultima_pesagem: linha.data_ultima_pesagem,
    escore_corporal: linha.escore_corporal,
    data_saida: linha.data_saida,
    motivo_saida: linha.motivo_saida,
    destino: linha.destino,
    peso_saida: linha.peso_saida,
    valor_venda: linha.valor_venda,
    observacoes: linha.observacoes,
  };
}
