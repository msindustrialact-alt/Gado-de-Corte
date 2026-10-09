"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const CHAVE_DISMISS = "gado-corte:pwa-install-dismiss";

export function BannerInstalarPwa({ className }: { className?: string }) {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    if (localStorage.getItem(CHAVE_DISMISS) === "1") {
      return;
    }

    const aoPrompt = (e: Event) => {
      e.preventDefault();
      setEvento(e as BeforeInstallPromptEvent);
      setVisivel(true);
    };

    window.addEventListener("beforeinstallprompt", aoPrompt);
    return () => window.removeEventListener("beforeinstallprompt", aoPrompt);
  }, []);

  if (!visivel || !evento) {
    return null;
  }

  async function instalar() {
    await evento!.prompt();
    const escolha = await evento!.userChoice;
    setVisivel(false);
    setEvento(null);

    if (escolha.outcome === "dismissed") {
      localStorage.setItem(CHAVE_DISMISS, "1");
    }
  }

  function dispensar() {
    localStorage.setItem(CHAVE_DISMISS, "1");
    setVisivel(false);
  }

  return (
    <div
      className={cn(
        "fixed inset-x-3 z-50 flex items-center gap-3 rounded-[12px] border border-border bg-card p-3 shadow-lg",
        "bottom-[max(0.75rem,env(safe-area-inset-bottom))]",
        className,
      )}
      role="dialog"
      aria-label="Instalar aplicativo"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[#DDF1E6] text-primary">
        <Download className="size-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-texto">Instalar no celular</p>
        <p className="text-xs text-texto-suave">
          Acesse como app, tela cheia e ícone na home.
        </p>
      </div>
      <Button
        type="button"
        className="h-9 shrink-0 rounded-[10px] px-3"
        onClick={() => void instalar()}
      >
        Instalar
      </Button>
      <button
        type="button"
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-texto-suave hover:bg-muted"
        aria-label="Fechar"
        onClick={dispensar}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
