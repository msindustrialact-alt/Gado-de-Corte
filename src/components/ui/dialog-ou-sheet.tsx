"use client";

import { useEffect, useState, type ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function useEhMobile() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const atualizar = () => setMobile(mql.matches);
    atualizar();
    mql.addEventListener("change", atualizar);
    return () => mql.removeEventListener("change", atualizar);
  }, []);

  return mobile;
}

export function DialogOuSheet({
  aberto,
  onAbertoChange,
  titulo,
  descricao,
  children,
  className,
}: {
  aberto: boolean;
  onAbertoChange: (aberto: boolean) => void;
  titulo: string;
  descricao?: string;
  children: ReactNode;
  className?: string;
}) {
  const mobile = useEhMobile();

  if (mobile) {
    return (
      <Sheet open={aberto} onOpenChange={onAbertoChange}>
        <SheetContent
          side="right"
          className="w-full gap-0 overflow-y-auto p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b border-border">
            <SheetTitle className="text-texto">{titulo}</SheetTitle>
            {descricao ? (
              <SheetDescription>{descricao}</SheetDescription>
            ) : null}
          </SheetHeader>
          <div className="p-4">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={aberto} onOpenChange={onAbertoChange}>
      <DialogContent className={cn("sm:max-w-lg", className)}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-texto">
            {titulo}
          </DialogTitle>
          {descricao ? (
            <DialogDescription>{descricao}</DialogDescription>
          ) : null}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
