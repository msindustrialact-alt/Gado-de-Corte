"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactElement } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChartColumn,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Cog,
  Dna,
  Folder,
  HeartPulse,
  House,
  Layers,
  Settings,
  Soup,
  Warehouse,
  Weight,
  Wheat,
} from "lucide-react";

import { IconeBoi } from "@/components/icons/icone-boi";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ITENS_NAV,
  rotaEstaAtiva,
  type IconeNav,
  type ItemNav,
} from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

const ICONES: Record<Exclude<IconeNav, "animais">, LucideIcon> = {
  inicio: House,
  lotes: Layers,
  pesagens: Weight,
  sanidade: HeartPulse,
  reproducao: Dna,
  manejo: Cog,
  pastagens: Wheat,
  confinamento: Warehouse,
  alimentacao: Soup,
  financeiro: CircleDollarSign,
  estoque: ClipboardList,
  relatorios: ChartColumn,
  cadastros: Folder,
  configuracoes: Settings,
};

type BarraLateralProps = {
  recolhida: boolean;
  onExpandir?: () => void;
  onNavigate?: () => void;
};

export function BarraLateral({
  recolhida,
  onExpandir,
  onNavigate,
}: BarraLateralProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar">
      <div
        className={cn(
          "flex shrink-0 items-center justify-center",
          recolhida ? "px-2 py-5" : "px-5 pb-4 pt-5",
        )}
      >
        <Image
          src="/images/logo.png"
          alt="Fazenda Joana – Serra Joana"
          width={476}
          height={170}
          priority
          className={cn(
            "h-auto transition-[width] duration-200",
            recolhida ? "w-[52px]" : "w-[160px]",
          )}
        />
      </div>

      <nav
        aria-label="Principal"
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto py-1 [scrollbar-width:thin]",
          recolhida ? "px-2" : "px-3",
        )}
      >
        {ITENS_NAV.map((item) => (
          <ItemMenu
            key={item.href}
            item={item}
            pathname={pathname}
            recolhida={recolhida}
            onExpandir={onExpandir}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {recolhida ? null : (
        <div className="relative mt-auto h-[152px] w-full shrink-0 overflow-hidden">
          <Image
            src="/images/sidebar-pasto.jpg"
            alt=""
            fill
            sizes="224px"
            className="object-cover object-bottom"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 via-black/20 to-transparent px-3 pb-4 pt-12">
            <p className="text-center text-[9px] font-medium uppercase leading-[1.5] tracking-[0.16em] text-card">
              Tradição no campo
              <br />
              Visão no futuro
            </p>
            <span className="mx-auto mt-2 block h-[2px] w-8 rounded-full bg-accent" />
          </div>
        </div>
      )}
    </div>
  );
}

function ItemMenu({
  item,
  pathname,
  recolhida,
  onExpandir,
  onNavigate,
}: {
  item: ItemNav;
  pathname: string;
  recolhida: boolean;
  onExpandir?: () => void;
  onNavigate?: () => void;
}) {
  const temFilhos = Boolean(item.filhos?.length);
  const filhoAtivo = item.filhos?.some((filho) =>
    rotaEstaAtiva(filho.href, pathname),
  );
  const ativo = temFilhos
    ? pathname === item.href
    : rotaEstaAtiva(item.href, pathname);
  const [aberto, setAberto] = useState(Boolean(filhoAtivo));

  useEffect(() => {
    if (filhoAtivo) {
      setAberto(true);
    }
  }, [filhoAtivo]);

  if (!temFilhos) {
    return (
      <ComTooltip rotulo={item.titulo} ativo={recolhida}>
        <Link
          href={item.href}
          aria-current={ativo ? "page" : undefined}
          aria-label={recolhida ? item.titulo : undefined}
          onClick={onNavigate}
          className={classesItem(ativo, recolhida)}
        >
          <IconeItem nome={item.icone} ativo={ativo} />
          {recolhida ? null : <span className="truncate">{item.titulo}</span>}
        </Link>
      </ComTooltip>
    );
  }

  if (recolhida) {
    return (
      <ComTooltip rotulo={item.titulo} ativo>
        <button
          type="button"
          aria-label={item.titulo}
          className={classesItem(ativo || Boolean(filhoAtivo), true)}
          onClick={() => {
            onExpandir?.();
            setAberto(true);
          }}
        >
          <IconeItem nome={item.icone} ativo={ativo || Boolean(filhoAtivo)} />
        </button>
      </ComTooltip>
    );
  }

  return (
    <Collapsible open={aberto} onOpenChange={setAberto}>
      <CollapsibleTrigger className={classesItem(ativo, false)}>
        <IconeItem nome={item.icone} ativo={ativo} />
        <span className="min-w-0 flex-1 truncate text-left">{item.titulo}</span>
        <ChevronRight
          aria-hidden
          className={cn(
            "size-4 shrink-0 text-texto-suave transition-transform duration-200",
            aberto && "rotate-90",
            ativo && "text-primary-foreground",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="flex h-[var(--collapsible-panel-height)] flex-col overflow-hidden data-[ending-style]:h-0 data-[starting-style]:h-0">
        <div className="mt-0.5 flex flex-col gap-0.5 pb-1">
          {item.filhos?.map((filho) => {
            const filhoEstaAtivo = rotaEstaAtiva(filho.href, pathname);

            return (
              <Link
                key={filho.href}
                href={filho.href}
                aria-current={filhoEstaAtivo ? "page" : undefined}
                onClick={onNavigate}
                className={cn(
                  "flex h-8 items-center rounded-[8px] pr-3 pl-11 text-[13px] font-medium transition-colors",
                  filhoEstaAtivo
                    ? "bg-primary text-primary-foreground"
                    : "text-texto-suave hover:bg-muted hover:text-texto",
                )}
              >
                {filho.titulo}
              </Link>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function IconeItem({ nome, ativo }: { nome: IconeNav; ativo: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-5 shrink-0 items-center justify-center",
        ativo ? "text-primary-foreground" : "text-primary",
      )}
    >
      {nome === "animais" ? (
        <IconeBoi className="h-[15px] w-[22px]" />
      ) : (
        <IconeLucide nome={nome} ativo={ativo} />
      )}
    </span>
  );
}

function IconeLucide({
  nome,
  ativo,
}: {
  nome: Exclude<IconeNav, "animais">;
  ativo: boolean;
}) {
  const Icone = ICONES[nome];

  return (
    <Icone
      className={cn("size-5", nome === "inicio" && ativo && "fill-current")}
      strokeWidth={1.75}
    />
  );
}

function classesItem(ativo: boolean, recolhida: boolean) {
  return cn(
    "flex h-9 w-full items-center rounded-[8px] text-sm font-medium transition-colors",
    recolhida ? "justify-center px-0" : "gap-3 px-3",
    ativo
      ? "bg-primary text-primary-foreground"
      : "text-texto hover:bg-muted",
  );
}

function ComTooltip({
  ativo,
  rotulo,
  children,
}: {
  ativo: boolean;
  rotulo: string;
  children: ReactElement;
}) {
  if (!ativo) {
    return children;
  }

  return (
    <Tooltip>
      <TooltipTrigger delay={0} render={children} />
      <TooltipContent side="right" sideOffset={10}>
        {rotulo}
      </TooltipContent>
    </Tooltip>
  );
}
