"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Archive,
  Fingerprint,
  GitBranch,
  Loader2,
  MapPinned,
  NotebookPen,
  Tag,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  atualizarAnimal,
  criarAnimal,
  arquivarAnimal,
} from "@/app/(app)/animais/actions";
import { CampoMoeda, formatarMoedaValor } from "@/components/animais/campo-moeda";
import { CampoNumero } from "@/components/animais/campo-numero";
import { ComboboxAnimal } from "@/components/animais/combobox-animal";
import { RacaSelect } from "@/components/animais/raca-select";
import {
  CLASSE_CAMPO,
  SegmentedControl,
} from "@/components/animais/segmented-control";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  LABELS_ORIGEM,
  LABELS_SEXO,
  OPCOES_CATEGORIA_FORM,
  OPCOES_CHIFRE_FORM,
  OPCOES_FASE_FORM,
  OPCOES_MOTIVO_FORM,
  OPCOES_PROPRIEDADE_FORM,
  OPCOES_STATUS_FORM,
  motivoPorStatus,
  rotuloParente,
  sugerirCategoria,
  sugerirFase,
  hojeISO,
  type AnimalDetalhe,
  type OpcaoFiltro,
  type OrigemAnimal,
  type SexoAnimal,
  type StatusAnimal,
} from "@/lib/animais";
import {
  VALORES_PADRAO_ANIMAL,
  schemaAnimal,
  type AnimalFormInput,
} from "@/lib/animais/schema";
import { cn } from "@/lib/utils";

function dataCampo(valor: string | null | undefined): string {
  return valor ? valor.slice(0, 10) : "";
}

function numeroCampo(valor: number | string | null | undefined): string {
  if (valor == null || valor === "") {
    return "";
  }

  const numero = typeof valor === "number" ? valor : Number(valor);

  if (!Number.isFinite(numero)) {
    return "";
  }

  if (Math.abs(numero - Math.round(numero)) < 0.005) {
    return String(Math.round(numero));
  }

  return String(numero).replace(".", ",");
}

function valoresDeAnimal(animal: AnimalDetalhe): AnimalFormInput {
  return {
    id: animal.id,
    brinco: animal.brinco,
    brinco_eletronico: animal.brinco_eletronico ?? "",
    sisbov: animal.sisbov ?? "",
    nome: animal.nome ?? "",
    sexo: animal.sexo,
    data_nascimento: dataCampo(animal.data_nascimento),
    nascimento_estimado: animal.nascimento_estimado,
    raca_id: animal.raca?.id ?? "",
    composicao_racial: animal.composicao_racial ?? "",
    pelagem: animal.pelagem ?? "",
    categoria: animal.categoria ?? "",
    tipo_chifre: animal.tipo_chifre ?? "",
    origem: animal.origem,
    pai_id: animal.pai?.id ?? "",
    mae_id: animal.mae?.id ?? "",
    fornecedor: animal.fornecedor ?? "",
    data_entrada: dataCampo(animal.data_entrada),
    peso_entrada: numeroCampo(animal.peso_entrada),
    valor_aquisicao: formatarMoedaValor(animal.valor_aquisicao),
    status: animal.status,
    fase_produtiva: animal.fase_produtiva ?? "",
    lote_id: animal.lote?.id ?? "",
    piquete_id: animal.piquete?.id ?? "",
    propriedade: animal.propriedade,
    peso_atual: numeroCampo(animal.peso_atual),
    data_ultima_pesagem: dataCampo(animal.data_ultima_pesagem),
    escore_corporal:
      animal.escore_corporal == null ? "" : String(animal.escore_corporal),
    data_saida: dataCampo(animal.data_saida),
    motivo_saida: animal.motivo_saida ?? "",
    destino: animal.destino ?? "",
    valor_venda: formatarMoedaValor(animal.valor_venda),
    peso_saida: numeroCampo(animal.peso_saida),
    observacoes: animal.observacoes ?? "",
  };
}

export function AnimalForm({
  modo,
  animal,
  racasIniciais,
  lotes,
  piquetes,
  pesoTravadoPorPesagem = false,
}: {
  modo: "novo" | "editar";
  animal?: AnimalDetalhe;
  racasIniciais: OpcaoFiltro[];
  lotes: OpcaoFiltro[];
  piquetes: OpcaoFiltro[];
  /** Quando true, peso_atual/data_ultima_pesagem só vêm do módulo de pesagens. */
  pesoTravadoPorPesagem?: boolean;
}) {
  const router = useRouter();
  const brincoRef = useRef<HTMLInputElement | null>(null);
  const ignorarSaida = useRef(false);
  const categoriaManual = useRef(modo === "editar");
  const faseManual = useRef(modo === "editar");
  const [acao, setAcao] = useState<"salvar" | "serie">("salvar");
  const [racas, setRacas] = useState(racasIniciais);
  const [rotuloPai, setRotuloPai] = useState(
    animal?.pai ? rotuloParente(animal.pai) : "",
  );
  const [rotuloMae, setRotuloMae] = useState(
    animal?.mae ? rotuloParente(animal.mae) : "",
  );
  const [avisoSaida, setAvisoSaida] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [arquivarAberto, setArquivarAberto] = useState(false);
  const [arquivando, setArquivando] = useState(false);
  const [erroArquivar, setErroArquivar] = useState<string | null>(null);
  const [hoje, setHoje] = useState("");
  const serieRef = useRef(false);

  useEffect(() => {
    setHoje(hojeISO());
  }, []);

  const iniciais =
    modo === "editar" && animal
      ? valoresDeAnimal(animal)
      : VALORES_PADRAO_ANIMAL;

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<AnimalFormInput>({
    resolver: zodResolver(schemaAnimal),
    defaultValues: iniciais,
  });

  const sexo = watch("sexo") as SexoAnimal | "";
  const origem = watch("origem") as OrigemAnimal;
  const status = watch("status") as StatusAnimal;
  const dataNascimento = watch("data_nascimento");
  const { ref: refBrinco, ...registroBrinco } = register("brinco");

  useEffect(() => {
    const sugerida = sugerirCategoria(sexo, dataNascimento);

    if (!categoriaManual.current && sugerida) {
      setValue("categoria", sugerida);
    }

    const fase = sugerirFase(dataNascimento);

    if (!faseManual.current && fase) {
      setValue("fase_produtiva", fase);
    }
  }, [sexo, dataNascimento, setValue]);

  useEffect(() => {
    function avisar(evento: BeforeUnloadEvent) {
      if (!isDirty || ignorarSaida.current) {
        return;
      }

      evento.preventDefault();
      evento.returnValue = "";
    }

    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    function noClique(evento: MouseEvent) {
      if (ignorarSaida.current) {
        return;
      }

      const alvo = (evento.target as HTMLElement | null)?.closest("a");

      if (!alvo || alvo.target === "_blank" || evento.metaKey || evento.ctrlKey) {
        return;
      }

      const href = alvo.getAttribute("href");

      if (!href || href.startsWith("#")) {
        return;
      }

      if (!window.confirm("Há alterações não salvas. Deseja sair?")) {
        evento.preventDefault();
        evento.stopPropagation();
      }
    }

    document.addEventListener("click", noClique, true);
    return () => document.removeEventListener("click", noClique, true);
  }, [isDirty]);

  function aplicarErros(fieldErrors?: Record<string, string[]>) {
    if (!fieldErrors) {
      return;
    }

    for (const [campo, mensagens] of Object.entries(fieldErrors)) {
      const mensagem = mensagens[0];

      if (mensagem) {
        setError(campo as keyof AnimalFormInput, { message: mensagem });
      }
    }
  }

  async function onSubmit(dados: AnimalFormInput) {
    setErroGeral(null);
    const resultado =
      modo === "editar" && animal
        ? await atualizarAnimal(animal.id, dados)
        : await criarAnimal(dados);

    if (!resultado.ok) {
      setErroGeral(resultado.message);
      aplicarErros(resultado.fieldErrors);
      return;
    }

    ignorarSaida.current = true;
    toast.success(
      modo === "editar"
        ? `Animal ${dados.brinco} atualizado`
        : `Animal ${dados.brinco} cadastrado`,
    );

    if (serieRef.current && modo === "novo") {
      const atuais = getValues();
      reset({
        ...VALORES_PADRAO_ANIMAL,
        lote_id: atuais.lote_id,
        piquete_id: atuais.piquete_id,
        propriedade: atuais.propriedade,
        raca_id: atuais.raca_id,
        origem: atuais.origem,
        fornecedor: atuais.fornecedor,
        data_entrada: atuais.data_entrada,
        status: atuais.status,
        fase_produtiva: atuais.fase_produtiva,
      });
      categoriaManual.current = false;
      faseManual.current = Boolean(atuais.fase_produtiva);
      serieRef.current = false;
      setRotuloPai("");
      setRotuloMae("");
      setAvisoSaida(false);
      ignorarSaida.current = false;
      window.setTimeout(() => brincoRef.current?.focus(), 50);
      return;
    }

    router.push(`/animais/${resultado.id}`);
    router.refresh();
  }

  async function confirmarArquivar() {
    if (!animal) {
      return;
    }

    setArquivando(true);
    setErroArquivar(null);
    const resultado = await arquivarAnimal(animal.id);
    setArquivando(false);

    if (!resultado.ok) {
      setErroArquivar(resultado.mensagem);
      return;
    }

    ignorarSaida.current = true;
    toast.success(`Animal ${animal.brinco} arquivado`);
    router.push("/animais");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-[1000px] space-y-4 pb-28"
    >
      <header>
        <h1 className="text-2xl font-bold text-texto">
          {modo === "editar" && animal
            ? `Editar ${animal.brinco}`
            : "Novo animal"}
        </h1>
        <p className="mt-1 text-sm text-texto-suave">
          Campos com * são obrigatórios.
        </p>
      </header>

      {erroGeral ? (
        <p className="rounded-[10px] border border-perigo/30 bg-perigo/10 px-3 py-2 text-sm text-perigo">
          {erroGeral}
        </p>
      ) : null}

      {modo === "editar" ? <input type="hidden" {...register("id")} /> : null}

      <Secao icone={Tag} titulo="Identificação">
        <CampoTexto
          id="brinco"
          rotulo="Brinco *"
          maxLength={20}
          erro={errors.brinco?.message}
          inputProps={{
            ...registroBrinco,
            ref: (el) => {
              refBrinco(el);
              brincoRef.current = el;
            },
          }}
        />
        <CampoTexto
          id="brinco_eletronico"
          rotulo="Brinco eletrônico"
          erro={errors.brinco_eletronico?.message}
          inputProps={register("brinco_eletronico")}
        />
        <CampoTexto
          id="sisbov"
          rotulo="SISBOV"
          erro={errors.sisbov?.message}
          inputProps={register("sisbov")}
        />
        <CampoTexto
          id="nome"
          rotulo="Nome"
          erro={errors.nome?.message}
          inputProps={register("nome")}
        />
        {/* TODO: upload de foto (foto_url) */}
      </Secao>

      <Secao icone={Fingerprint} titulo="Características">
        <div>
          <Label className="mb-1.5 text-sm text-texto">Sexo *</Label>
          <SegmentedControl
            ariaLabel="Sexo"
            valor={sexo}
            erro={errors.sexo?.message}
            opcoes={[
              { valor: "macho", rotulo: LABELS_SEXO.macho },
              { valor: "femea", rotulo: LABELS_SEXO.femea },
            ]}
            onChange={(valor) =>
              setValue("sexo", valor, { shouldDirty: true, shouldValidate: true })
            }
          />
        </div>
        <div>
          <Label htmlFor="data_nascimento" className="mb-1.5 text-sm text-texto">
            Data de nascimento
          </Label>
          <input
            id="data_nascimento"
            type="date"
            max={hoje || undefined}
            aria-invalid={errors.data_nascimento ? true : undefined}
            className={CLASSE_CAMPO}
            {...register("data_nascimento")}
          />
          {errors.data_nascimento ? (
            <p className="mt-1 text-sm text-perigo">
              {errors.data_nascimento.message}
            </p>
          ) : null}
          <label className="mt-2 flex min-h-11 items-center gap-2 text-base text-texto">
            <input
              type="checkbox"
              className="size-4 rounded border-border"
              {...register("nascimento_estimado")}
            />
            Nascimento estimado
          </label>
        </div>
        <RacaSelect
          id="raca_id"
          valor={watch("raca_id") ?? ""}
          racas={racas}
          erro={errors.raca_id?.message}
          onChange={(valor) =>
            setValue("raca_id", valor, { shouldDirty: true })
          }
          onRacasChange={setRacas}
        />
        <CampoTexto
          id="composicao_racial"
          rotulo="Composição racial"
          erro={errors.composicao_racial?.message}
          inputProps={register("composicao_racial")}
        />
        <CampoTexto
          id="pelagem"
          rotulo="Pelagem"
          erro={errors.pelagem?.message}
          inputProps={register("pelagem")}
        />
        <CampoSelect
          id="categoria"
          rotulo="Categoria"
          valor={watch("categoria") ?? ""}
          erro={errors.categoria?.message}
          opcoes={[{ valor: "", rotulo: "Sem categoria" }, ...OPCOES_CATEGORIA_FORM]}
          onChange={(valor) => {
            categoriaManual.current = true;
            setValue("categoria", valor, { shouldDirty: true });
          }}
        />
        <CampoSelect
          id="tipo_chifre"
          rotulo="Tipo de chifre"
          valor={watch("tipo_chifre") ?? ""}
          erro={errors.tipo_chifre?.message}
          opcoes={[{ valor: "", rotulo: "Não informado" }, ...OPCOES_CHIFRE_FORM]}
          onChange={(valor) =>
            setValue("tipo_chifre", valor, { shouldDirty: true })
          }
        />
      </Secao>

      <Secao icone={GitBranch} titulo="Origem e genealogia">
        <div className="sm:col-span-2">
          <Label className="mb-1.5 text-sm text-texto">Origem</Label>
          <SegmentedControl
            ariaLabel="Origem"
            valor={origem}
            opcoes={[
              {
                valor: "nascido_fazenda",
                rotulo: LABELS_ORIGEM.nascido_fazenda,
              },
              { valor: "comprado", rotulo: LABELS_ORIGEM.comprado },
            ]}
            onChange={(valor) =>
              setValue("origem", valor, { shouldDirty: true })
            }
          />
        </div>
        <ComboboxAnimal
          id="pai_id"
          rotulo="Pai"
          placeholder="Buscar macho"
          valor={watch("pai_id") ?? ""}
          rotuloSelecionado={rotuloPai}
          sexo="macho"
          excluirId={animal?.id}
          erro={errors.pai_id?.message}
          onChange={(id, rotulo) => {
            setValue("pai_id", id, { shouldDirty: true });
            setRotuloPai(rotulo);
          }}
        />
        <ComboboxAnimal
          id="mae_id"
          rotulo="Mãe"
          placeholder="Buscar fêmea"
          valor={watch("mae_id") ?? ""}
          rotuloSelecionado={rotuloMae}
          sexo="femea"
          excluirId={animal?.id}
          erro={errors.mae_id?.message}
          onChange={(id, rotulo) => {
            setValue("mae_id", id, { shouldDirty: true });
            setRotuloMae(rotulo);
          }}
        />
        {origem === "comprado" ? (
          <>
            <CampoTexto
              id="fornecedor"
              rotulo="Fornecedor"
              erro={errors.fornecedor?.message}
              inputProps={register("fornecedor")}
            />
            <div>
              <Label htmlFor="data_entrada" className="mb-1.5 text-sm text-texto">
                Data de entrada
              </Label>
              <input
                id="data_entrada"
                type="date"
                max={hoje || undefined}
                className={CLASSE_CAMPO}
                aria-invalid={errors.data_entrada ? true : undefined}
                {...register("data_entrada")}
              />
              {errors.data_entrada ? (
                <p className="mt-1 text-sm text-perigo">
                  {errors.data_entrada.message}
                </p>
              ) : null}
            </div>
            <CampoNumero
              id="peso_entrada"
              rotulo="Peso de entrada"
              sufixo="kg"
              valor={watch("peso_entrada")}
              erro={errors.peso_entrada?.message}
              onChange={(valor) =>
                setValue("peso_entrada", valor, { shouldDirty: true })
              }
            />
            <CampoMoeda
              id="valor_aquisicao"
              rotulo="Valor de aquisição"
              valor={watch("valor_aquisicao")}
              erro={errors.valor_aquisicao?.message}
              onChange={(valor) =>
                setValue("valor_aquisicao", valor, { shouldDirty: true })
              }
            />
          </>
        ) : null}
      </Secao>

      <Secao icone={MapPinned} titulo="Situação atual">
        <div className="sm:col-span-2">
          <Label className="mb-1.5 text-sm text-texto">Fazenda *</Label>
          <SegmentedControl
            ariaLabel="Fazenda"
            valor={watch("propriedade") ?? ""}
            erro={errors.propriedade?.message}
            opcoes={OPCOES_PROPRIEDADE_FORM}
            onChange={(valor) =>
              setValue("propriedade", valor, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
          <p className="mt-1.5 text-xs text-texto-suave">
            Unidade onde o animal está agora. Use ao levar ou trazer entre Joana e Cataguá.
          </p>
        </div>
        <CampoSelect
          id="status"
          rotulo="Status"
          valor={status}
          erro={errors.status?.message}
          opcoes={OPCOES_STATUS_FORM}
          onChange={(valor) => {
            const proximo = valor as StatusAnimal;
            const atual = getValues("status") as StatusAnimal;
            setValue("status", proximo, { shouldDirty: true });

            if (proximo === "ativo" && atual !== "ativo") {
              setValue("data_saida", "");
              setValue("motivo_saida", "");
              setValue("destino", "");
              setValue("valor_venda", "");
              setValue("peso_saida", "");
              setAvisoSaida(true);
              return;
            }

            if (proximo !== "ativo") {
              const sugerido = motivoPorStatus(proximo);

              if (sugerido && !getValues("motivo_saida")) {
                setValue("motivo_saida", sugerido);
              }

              setAvisoSaida(false);
            }
          }}
        />
        <CampoSelect
          id="fase_produtiva"
          rotulo="Fase produtiva"
          valor={watch("fase_produtiva") ?? ""}
          erro={errors.fase_produtiva?.message}
          opcoes={[{ valor: "", rotulo: "Não informada" }, ...OPCOES_FASE_FORM]}
          onChange={(valor) => {
            faseManual.current = true;
            setValue("fase_produtiva", valor, { shouldDirty: true });
          }}
        />
        <CampoSelect
          id="lote_id"
          rotulo="Lote"
          valor={watch("lote_id") ?? ""}
          erro={errors.lote_id?.message}
          opcoes={[{ valor: "", rotulo: "Sem lote" }, ...lotes]}
          onChange={(valor) => setValue("lote_id", valor, { shouldDirty: true })}
        />
        <CampoSelect
          id="piquete_id"
          rotulo="Piquete"
          valor={watch("piquete_id") ?? ""}
          erro={errors.piquete_id?.message}
          opcoes={[{ valor: "", rotulo: "Sem piquete" }, ...piquetes]}
          onChange={(valor) =>
            setValue("piquete_id", valor, { shouldDirty: true })
          }
        />
        <CampoNumero
          id="peso_atual"
          rotulo="Peso atual"
          sufixo="kg"
          valor={watch("peso_atual")}
          erro={errors.peso_atual?.message}
          desabilitado={pesoTravadoPorPesagem}
          onChange={(valor) =>
            setValue("peso_atual", valor, { shouldDirty: true })
          }
        />
        <div>
          <Label
            htmlFor="data_ultima_pesagem"
            className="mb-1.5 text-sm text-texto"
          >
            Data da pesagem
          </Label>
          <input
            id="data_ultima_pesagem"
            type="date"
            max={hoje || undefined}
            disabled={pesoTravadoPorPesagem}
            className={CLASSE_CAMPO}
            {...register("data_ultima_pesagem")}
          />
          {errors.data_ultima_pesagem ? (
            <p className="mt-1 text-sm text-perigo">
              {errors.data_ultima_pesagem.message}
            </p>
          ) : null}
          {pesoTravadoPorPesagem ? (
            <p className="mt-1.5 text-xs text-texto-suave">
              Peso controlado pelo módulo de pesagens.{" "}
              <Link
                href={`/animais/${animal?.id}`}
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                Ver histórico
              </Link>
              {animal?.lote?.id ? (
                <>
                  {" · "}
                  <Link
                    href={`/pesagens/nova?lote=${animal.lote.id}`}
                    className="font-medium text-primary underline-offset-2 hover:underline"
                  >
                    Registrar pesagem
                  </Link>
                </>
              ) : (
                <>
                  {" · "}
                  <Link
                    href="/pesagens/nova"
                    className="font-medium text-primary underline-offset-2 hover:underline"
                  >
                    Registrar pesagem
                  </Link>
                </>
              )}
            </p>
          ) : null}
        </div>
        <CampoSelect
          id="escore_corporal"
          rotulo="Escore corporal"
          valor={watch("escore_corporal")}
          erro={errors.escore_corporal?.message}
          opcoes={[
            { valor: "", rotulo: "Não informado" },
            { valor: "1", rotulo: "1" },
            { valor: "2", rotulo: "2" },
            { valor: "3", rotulo: "3" },
            { valor: "4", rotulo: "4" },
            { valor: "5", rotulo: "5" },
          ]}
          onChange={(valor) =>
            setValue("escore_corporal", valor, { shouldDirty: true })
          }
        />
      </Secao>

      {status !== "ativo" ? (
        <Secao icone={LogOut} titulo="Saída">
          <div>
            <Label htmlFor="data_saida" className="mb-1.5 text-sm text-texto">
              Data de saída *
            </Label>
            <input
              id="data_saida"
              type="date"
              max={hoje || undefined}
              className={CLASSE_CAMPO}
              aria-invalid={errors.data_saida ? true : undefined}
              {...register("data_saida")}
            />
            {errors.data_saida ? (
              <p className="mt-1 text-sm text-perigo">
                {errors.data_saida.message}
              </p>
            ) : null}
          </div>
          <CampoSelect
            id="motivo_saida"
            rotulo="Motivo *"
            valor={watch("motivo_saida") ?? ""}
            erro={errors.motivo_saida?.message}
            opcoes={[{ valor: "", rotulo: "Selecione" }, ...OPCOES_MOTIVO_FORM]}
            onChange={(valor) =>
              setValue("motivo_saida", valor, { shouldDirty: true })
            }
          />
          <CampoTexto
            id="destino"
            rotulo="Destino / comprador"
            erro={errors.destino?.message}
            inputProps={register("destino")}
          />
          <CampoMoeda
            id="valor_venda"
            rotulo="Valor de venda"
            valor={watch("valor_venda")}
            erro={errors.valor_venda?.message}
            onChange={(valor) =>
              setValue("valor_venda", valor, { shouldDirty: true })
            }
          />
          <CampoNumero
            id="peso_saida"
            rotulo="Peso de saída"
            sufixo="kg"
            valor={watch("peso_saida")}
            erro={errors.peso_saida?.message}
            onChange={(valor) =>
              setValue("peso_saida", valor, { shouldDirty: true })
            }
          />
        </Secao>
      ) : avisoSaida ? (
        <p className="text-sm text-texto-suave">
          O animal voltou para ativo: os dados de saída foram limpos.
        </p>
      ) : null}

      <Secao icone={NotebookPen} titulo="Observações">
        <div className="sm:col-span-2">
          <Label htmlFor="observacoes" className="mb-1.5 text-sm text-texto">
            Observações
          </Label>
          <Textarea
            id="observacoes"
            rows={4}
            className="min-h-28 rounded-[10px] border-border text-base"
            {...register("observacoes")}
          />
        </div>
      </Secao>

      {modo === "editar" && animal ? (
        <section className="rounded-[12px] border border-perigo/30 bg-card p-4 shadow-card">
          <h2 className="flex items-center gap-2 text-[17px] font-semibold text-perigo">
            <Archive className="size-4" />
            Zona de risco
          </h2>
          <p className="mt-1 text-sm text-texto-suave">
            Arquivar tira o animal da listagem, mas o histórico permanece.
          </p>
          {erroArquivar ? (
            <p className="mt-2 text-sm text-perigo">{erroArquivar}</p>
          ) : null}
          <Button
            type="button"
            variant="destructive"
            className="mt-4 h-11 rounded-[10px]"
            onClick={() => setArquivarAberto(true)}
          >
            Arquivar animal
          </Button>
        </section>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg-app/95 px-4 py-3 backdrop-blur md:sticky md:inset-x-auto md:mx-auto md:max-w-[1000px] md:rounded-t-[12px]">
        <div className="mx-auto flex max-w-[1000px] flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-[10px]"
            nativeButton={false}
            render={<Link href="/animais" />}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          {modo === "novo" ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-[10px]"
              disabled={isSubmitting}
              onClick={() => {
                serieRef.current = true;
                setAcao("serie");
                void handleSubmit(onSubmit)();
              }}
            >
              {isSubmitting && acao === "serie" ? (
                <Loader2 className="animate-spin" />
              ) : null}
              Salvar e cadastrar outro
            </Button>
          ) : null}
          <Button
            type="submit"
            className="h-11 rounded-[10px]"
            disabled={isSubmitting}
            onClick={() => {
              serieRef.current = false;
              setAcao("salvar");
            }}
          >
            {isSubmitting && acao === "salvar" ? (
              <Loader2 className="animate-spin" />
            ) : null}
            Salvar
          </Button>
        </div>
      </div>

      <Dialog open={arquivarAberto} onOpenChange={setArquivarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arquivar animal?</DialogTitle>
            <DialogDescription>
              O animal {animal?.brinco} sai da listagem, mas o cadastro não é
              excluído.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setArquivarAberto(false)}
              disabled={arquivando}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmarArquivar}
              disabled={arquivando}
            >
              {arquivando ? "Arquivando..." : "Arquivar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}

function Secao({
  titulo,
  icone: Icone,
  children,
}: {
  titulo: string;
  icone: typeof Tag;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[12px] border border-border bg-card p-4 shadow-card md:p-5">
      <h2 className="mb-4 flex items-center gap-2 text-[17px] font-semibold text-texto">
        <Icone className="size-4 text-primary" aria-hidden />
        {titulo}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function CampoTexto({
  id,
  rotulo,
  erro,
  maxLength,
  inputProps,
}: {
  id: string;
  rotulo: string;
  erro?: string;
  maxLength?: number;
  inputProps: InputHTMLAttributes<HTMLInputElement> & {
    ref?: Ref<HTMLInputElement>;
  };
}) {
  return (
    <div className="min-w-0">
      <Label htmlFor={id} className="mb-1.5 text-sm text-texto">
        {rotulo}
      </Label>
      <input
        id={id}
        maxLength={maxLength}
        autoComplete="off"
        aria-invalid={erro ? true : undefined}
        className={CLASSE_CAMPO}
        {...inputProps}
      />
      {erro ? <p className="mt-1 text-sm text-perigo">{erro}</p> : null}
    </div>
  );
}

function CampoSelect({
  id,
  rotulo,
  valor,
  opcoes,
  onChange,
  erro,
}: {
  id: string;
  rotulo: string;
  valor: string;
  opcoes: OpcaoFiltro[];
  onChange: (valor: string) => void;
  erro?: string;
}) {
  return (
    <div className="min-w-0">
      <Label htmlFor={id} className="mb-1.5 text-sm text-texto">
        {rotulo}
      </Label>
      <select
        id={id}
        value={valor}
        aria-invalid={erro ? true : undefined}
        onChange={(evento) => onChange(evento.target.value)}
        className={cn(CLASSE_CAMPO, "bg-card")}
      >
        {opcoes.map((opcao) => (
          <option key={`${id}-${opcao.valor || "vazio"}`} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
      </select>
      {erro ? <p className="mt-1 text-sm text-perigo">{erro}</p> : null}
    </div>
  );
}
