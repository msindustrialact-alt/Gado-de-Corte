"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { registrarVendaAbateAction } from "@/app/(app)/financeiro/receitas/actions";
import { CampoMoeda } from "@/components/animais/campo-moeda";
import { CLASSE_CAMPO } from "@/components/animais/segmented-control";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hojeISO, parseNumeroPt } from "@/lib/animais";
import { formatarData, formatarDecimal, formatarMoeda } from "@/lib/formatacao";
import {
  exigeCienciaCarencia,
  fecharVenda,
  rotuloDiferenca,
  type FormaVendaAbate,
} from "@/lib/receitas/calculo";
import type { AnimalReceita, LoteReceita } from "@/lib/receitas/data";

type Linha = { id: string; descricao: string; valor: string };

const FORMAS: { valor: FormaVendaAbate; rotulo: string }[] = [
  { valor: "rendimento", rotulo: "Rendimento" },
  { valor: "desconto", rotulo: "Desconto de @" },
  { valor: "arrobas_pagas", rotulo: "Arrobas pagas" },
];

function pesoInicial(valor: number | null): string {
  if (valor == null) {
    return "";
  }

  return String(valor).replace(".", ",");
}

export function ReceitaNovaTela({
  animais,
  lotes,
}: {
  animais: AnimalReceita[];
  lotes: LoteReceita[];
}) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  const [data, setData] = useState(hojeISO());
  const [comprador, setComprador] = useState("");
  const [documento, setDocumento] = useState("");
  const [frigorifico, setFrigorifico] = useState("");
  const [cidade, setCidade] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [busca, setBusca] = useState("");
  const [loteId, setLoteId] = useState("");
  const [pesos, setPesos] = useState<Record<string, string>>({});
  const [forma, setForma] = useState<FormaVendaAbate>("rendimento");
  const [rendimento, setRendimento] = useState("54");
  const [desconto, setDesconto] = useState("");
  const [arrobasPagas, setArrobasPagas] = useState("");
  const [valorArroba, setValorArroba] = useState("");
  const [descontos, setDescontos] = useState<Linha[]>([]);
  const [despesas, setDespesas] = useState<Linha[]>([]);
  const [ciencia, setCiencia] = useState(false);

  const visiveis = useMemo(() => {
    const texto = busca.trim().toLowerCase();

    return animais.filter((animal) => {
      const noLote = !loteId || animal.loteId === loteId;
      const noTexto =
        !texto ||
        animal.brinco.toLowerCase().includes(texto) ||
        (animal.nome ?? "").toLowerCase().includes(texto);

      return noLote && noTexto;
    });
  }, [animais, busca, loteId]);

  const marcados = animais.filter((animal) => animal.id in pesos);
  const linhasDesconto = descontos.flatMap((linha) => {
    const arrobas = parseNumeroPt(linha.valor);

    if (!linha.descricao.trim() && arrobas == null) {
      return [];
    }

    return [{ descricao: linha.descricao, arrobas: arrobas ?? Number.NaN }];
  });
  const linhasDespesa = despesas.flatMap((linha) => {
    const valor = parseNumeroPt(linha.valor);

    if (!linha.descricao.trim() && (valor == null || valor === 0)) {
      return [];
    }

    return [{ descricao: linha.descricao, valor: valor ?? Number.NaN }];
  });
  const fechamento = fecharVenda({
    pesosKg: marcados.map((animal) => parseNumeroPt(pesos[animal.id]) ?? Number.NaN),
    forma,
    rendimentoPct: forma === "rendimento" ? parseNumeroPt(rendimento) : null,
    descontoArrobas:
      forma === "desconto" && linhasDesconto.length === 0 ? parseNumeroPt(desconto) : null,
    linhasDesconto: forma === "desconto" ? linhasDesconto : [],
    arrobasPagas: forma === "arrobas_pagas" ? parseNumeroPt(arrobasPagas) : null,
    valorArroba: parseNumeroPt(valorArroba) ?? Number.NaN,
    despesas: linhasDespesa,
  });
  const avisos = marcados.flatMap((animal) =>
    animal.carencias
      .filter((carencia) => carencia.liberacao > data)
      .map((carencia) => ({
        brinco: animal.brinco,
        medicamento: carencia.medicamento,
        liberacao: carencia.liberacao,
      })),
  );
  const pedeCiencia = exigeCienciaCarencia(
    avisos.map((aviso) => aviso.liberacao),
    data,
  );

  function alternar(animal: AnimalReceita) {
    setPesos((atual) => {
      if (animal.id in atual) {
        const proximo = { ...atual };
        delete proximo[animal.id];
        return proximo;
      }

      return { ...atual, [animal.id]: pesoInicial(animal.pesoAtual) };
    });
  }

  function confirmar() {
    if (!fechamento.ok) {
      toast.error(fechamento.message);
      return;
    }

    if (pedeCiencia && !ciencia) {
      toast.error("Confirme que está ciente da carência.");
      return;
    }

    iniciar(async () => {
      const resultado = await registrarVendaAbateAction({
        data,
        compradorNome: comprador,
        compradorDocumento: documento,
        frigorifico,
        cidade,
        observacoes,
        forma,
        rendimentoPct: forma === "rendimento" ? parseNumeroPt(rendimento) : null,
        descontoArrobas:
          forma === "desconto" && linhasDesconto.length === 0 ? parseNumeroPt(desconto) : null,
        linhasDesconto: forma === "desconto" ? linhasDesconto : [],
        arrobasPagas: forma === "arrobas_pagas" ? parseNumeroPt(arrobasPagas) : null,
        valorArroba: parseNumeroPt(valorArroba) ?? 0,
        despesas: linhasDespesa,
        cienciaCarencia: pedeCiencia && ciencia,
        animais: marcados.map((animal) => ({
          animalId: animal.id,
          pesoKg: parseNumeroPt(pesos[animal.id]) ?? 0,
        })),
      });

      if (!resultado.ok) {
        toast.error(resultado.message);
        return;
      }

      toast.success("Receita gravada. Os animais saíram do rebanho.");
      router.push(`/financeiro/receitas/${resultado.id}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-texto">Nova receita</h1>
        <p className="mt-1 text-sm text-texto-suave">
          Marque quem sai, informe o peso e feche do jeito que o frigorífico paga.
        </p>
      </header>

      <section className="grid gap-3 rounded-[12px] border border-border bg-card p-4 shadow-card sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-texto">Data da saída</span>
          <input
            type="date"
            max={hojeISO()}
            value={data}
            onChange={(evento) => setData(evento.target.value)}
            className={CLASSE_CAMPO}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-texto">Comprador</span>
          <Input value={comprador} onChange={(evento) => setComprador(evento.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-texto">Frigorífico</span>
          <Input value={frigorifico} onChange={(evento) => setFrigorifico(evento.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-texto">Documento</span>
          <Input value={documento} onChange={(evento) => setDocumento(evento.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-texto">Cidade</span>
          <Input value={cidade} onChange={(evento) => setCidade(evento.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-sm text-texto">Observação</span>
          <Input value={observacoes} onChange={(evento) => setObservacoes(evento.target.value)} />
        </label>
      </section>

      <section className="rounded-[12px] border border-border bg-card p-4 shadow-card">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-texto">Buscar brinco</span>
            <Input
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Brinco ou nome"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-texto">Lote</span>
            <select
              value={loteId}
              onChange={(evento) => setLoteId(evento.target.value)}
              className={CLASSE_CAMPO}
            >
              <option value="">Todos</option>
              {lotes.map((lote) => (
                <option key={lote.id} value={lote.id}>
                  {lote.nome}
                </option>
              ))}
            </select>
          </label>
        </div>
        <ul className="mt-3 max-h-[360px] space-y-2 overflow-y-auto">
          {visiveis.length === 0 ? (
            <li className="py-6 text-center text-sm text-texto-suave">Nenhum animal ativo nessa busca.</li>
          ) : (
            visiveis.map((animal) => {
              const marcado = animal.id in pesos;
              const emCarencia = animal.carencias.some((carencia) => carencia.liberacao > data);

              return (
                <li key={animal.id} className="rounded-[10px] border border-border px-3 py-2">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={() => alternar(animal)}
                      aria-label={`Marcar ${animal.brinco}`}
                      className="mt-1 size-4"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-texto">
                        {animal.brinco}
                        {animal.nome ? ` · ${animal.nome}` : ""}
                      </p>
                      <p className="text-xs text-texto-suave">
                        {animal.loteNome ?? "Sem lote"}
                        {animal.pesoAtual != null
                          ? ` · última ${formatarDecimal(animal.pesoAtual, 1)} kg`
                          : " · sem pesagem"}
                        {animal.dataUltimaPesagem ? ` em ${formatarData(animal.dataUltimaPesagem)}` : ""}
                        {emCarencia ? " · em carência" : ""}
                      </p>
                    </div>
                    {marcado ? (
                      <label className="w-28 shrink-0">
                        <span className="sr-only">Peso de {animal.brinco}</span>
                        <Input
                          inputMode="decimal"
                          value={pesos[animal.id] ?? ""}
                          onChange={(evento) =>
                            setPesos((atual) => ({ ...atual, [animal.id]: evento.target.value }))
                          }
                          placeholder="kg"
                        />
                      </label>
                    ) : null}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </section>

      <section className="space-y-3 rounded-[12px] border border-border bg-card p-4 shadow-card">
        <div className="flex flex-wrap gap-2">
          {FORMAS.map((opcao) => (
            <button
              key={opcao.valor}
              type="button"
              onClick={() => setForma(opcao.valor)}
              className={`h-9 rounded-[10px] border px-3 text-sm ${
                forma === opcao.valor
                  ? "border-[#1D6A3D] bg-[#DDF1E6] font-medium text-[#1D6A3D]"
                  : "border-border text-texto"
              }`}
            >
              {opcao.rotulo}
            </button>
          ))}
        </div>
        {forma === "rendimento" ? (
          <label className="flex max-w-xs flex-col gap-1.5">
            <span className="text-sm text-texto">Rendimento da carcaça (%)</span>
            <Input
              inputMode="decimal"
              value={rendimento}
              onChange={(evento) => setRendimento(evento.target.value)}
            />
          </label>
        ) : null}
        {forma === "desconto" ? (
          <div className="space-y-2">
            {descontos.length === 0 ? (
              <label className="flex max-w-xs flex-col gap-1.5">
                <span className="text-sm text-texto">Desconto total de @</span>
                <Input
                  inputMode="decimal"
                  value={desconto}
                  onChange={(evento) => setDesconto(evento.target.value)}
                  placeholder="0 se não houver"
                />
              </label>
            ) : (
              descontos.map((linha) => (
                <div key={linha.id} className="grid grid-cols-[1fr_120px_auto] gap-2">
                  <Input
                    value={linha.descricao}
                    placeholder="Quebra, toalete..."
                    onChange={(evento) =>
                      setDescontos((atual) =>
                        atual.map((item) =>
                          item.id === linha.id ? { ...item, descricao: evento.target.value } : item,
                        ),
                      )
                    }
                  />
                  <Input
                    inputMode="decimal"
                    value={linha.valor}
                    placeholder="@"
                    onChange={(evento) =>
                      setDescontos((atual) =>
                        atual.map((item) =>
                          item.id === linha.id ? { ...item, valor: evento.target.value } : item,
                        ),
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDescontos((atual) => atual.filter((item) => item.id !== linha.id))}
                  >
                    Tirar
                  </Button>
                </div>
              ))
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setDescontos((atual) => [
                  ...atual,
                  { id: crypto.randomUUID(), descricao: "", valor: "" },
                ])
              }
            >
              Discriminar desconto
            </Button>
          </div>
        ) : null}
        {forma === "arrobas_pagas" ? (
          <label className="flex max-w-xs flex-col gap-1.5">
            <span className="text-sm text-texto">@ pagas</span>
            <Input
              inputMode="decimal"
              value={arrobasPagas}
              onChange={(evento) => setArrobasPagas(evento.target.value)}
            />
          </label>
        ) : null}
        <CampoMoeda id="valor_arroba" rotulo="Valor da @" valor={valorArroba} onChange={setValorArroba} />
        <div className="space-y-2">
          <Label>Outras despesas</Label>
          {despesas.map((linha) => (
            <div key={linha.id} className="grid grid-cols-[1fr_140px_auto] gap-2">
              <Input
                value={linha.descricao}
                placeholder="Frete, GTA, Funrural..."
                onChange={(evento) =>
                  setDespesas((atual) =>
                    atual.map((item) =>
                      item.id === linha.id ? { ...item, descricao: evento.target.value } : item,
                    ),
                  )
                }
              />
              <Input
                inputMode="decimal"
                value={linha.valor}
                placeholder="R$"
                onChange={(evento) =>
                  setDespesas((atual) =>
                    atual.map((item) =>
                      item.id === linha.id ? { ...item, valor: evento.target.value } : item,
                    ),
                  )
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setDespesas((atual) => atual.filter((item) => item.id !== linha.id))}
              >
                Tirar
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setDespesas((atual) => [...atual, { id: crypto.randomUUID(), descricao: "", valor: "" }])
            }
          >
            Adicionar despesa
          </Button>
        </div>
      </section>

      <section className="rounded-[12px] border border-border bg-card p-4 shadow-card">
        {fechamento.ok ? (
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <p>Animais: {fechamento.qtd}</p>
            <p>Peso vivo: {formatarDecimal(fechamento.pesoVivoTotal, 1)} kg</p>
            <p>@ viva: {formatarDecimal(fechamento.arrobasVivas, 3)}</p>
            <p>@ pagas: {formatarDecimal(fechamento.arrobasPagas, 3)}</p>
            <p>
              {rotuloDiferenca(fechamento.diferencaArrobas) === "nenhuma"
                ? "Diferença: nenhuma"
                : `${rotuloDiferenca(fechamento.diferencaArrobas) === "acréscimo" ? "Acréscimo" : "Desconto"}: ${formatarDecimal(Math.abs(fechamento.diferencaArrobas), 3)} @`}
            </p>
            <p>Bruto: {formatarMoeda(fechamento.valorBruto)}</p>
            <p>Despesas: {formatarMoeda(fechamento.despesasTotal)}</p>
            <p className="font-semibold">Líquido: {formatarMoeda(fechamento.valorLiquido)}</p>
          </div>
        ) : (
          <p className="text-sm text-texto-suave">{fechamento.message}</p>
        )}
        {avisos.length > 0 ? (
          <div className="mt-3 space-y-1 text-sm text-[#8A4B08]">
            {avisos.map((aviso) => (
              <p key={`${aviso.brinco}-${aviso.medicamento}-${aviso.liberacao}`}>
                {aviso.brinco} · {aviso.medicamento} · abate a partir de {formatarData(aviso.liberacao)}
              </p>
            ))}
            <label className="mt-2 flex items-center gap-2 text-texto">
              <input
                type="checkbox"
                checked={ciencia}
                onChange={(evento) => setCiencia(evento.target.checked)}
              />
              Estou ciente da carência
            </label>
          </div>
        ) : null}
        <Button
          type="button"
          className="mt-4 h-11 rounded-[10px]"
          disabled={pendente || !fechamento.ok || (pedeCiencia && !ciencia)}
          onClick={confirmar}
        >
          {pendente ? <Loader2 className="size-4 animate-spin" /> : null}
          Confirmar saída
        </Button>
      </section>
    </div>
  );
}
