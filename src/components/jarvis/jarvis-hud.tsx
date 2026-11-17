"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getFazendaAtiva } from "@/lib/fazenda";

export function JarvisHUD() {
  const [stats, setStats] = useState({
    animais: 0,
    lotes: 0,
    pesoMedio: 0,
    pendencias: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const fazenda = await getFazendaAtiva();
        if (!fazenda) return;

        const supabase = createClient();

        const [
          { count: animais },
          { count: lotes },
          { data: pesosData },
        ] = await Promise.all([
          supabase
            .from("animais")
            .select("id", { count: "exact", head: true })
            .eq("fazenda_id", fazenda.id)
            .eq("status", "ativo")
            .is("deleted_at", null),
          supabase
            .from("lotes")
            .select("id", { count: "exact", head: true })
            .eq("fazenda_id", fazenda.id)
            .eq("status", "ativo")
            .is("deleted_at", null),
          supabase
            .from("animais")
            .select("peso_atual")
            .eq("fazenda_id", fazenda.id)
            .eq("status", "ativo")
            .not("peso_atual", "is", null)
            .is("deleted_at", null),
        ]);

        const pesoMedio = pesosData?.length
          ? Math.round(
              pesosData.reduce((acc, curr) => acc + (curr.peso_atual || 0), 0) /
                pesosData.length
            )
          : 0;

        setStats({
          animais: animais || 0,
          lotes: lotes || 0,
          pesoMedio,
          pendencias: 0,
        });
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute bottom-8 left-8 right-8 flex justify-between gap-4">
      <HUDPanel label="ANIMAIS ATIVOS" value={stats.animais.toString()} />
      <HUDPanel label="LOTES ATIVOS" value={stats.lotes.toString()} />
      <HUDPanel label="PESO MÉDIO" value={`${stats.pesoMedio} KG`} />
      <HUDPanel label="PENDÊNCIAS" value={stats.pendencias.toString()} alert={stats.pendencias > 0} />
    </div>
  );
}

function HUDPanel({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="flex-1 bg-black/50 border border-accent/30 backdrop-blur-sm p-4 rounded">
      <div className="text-xs text-gray-400 font-mono mb-1 tracking-wider">{label}</div>
      <div className={`text-2xl font-bold font-mono ${alert ? "text-yellow-500" : "text-accent"}`}>
        {value}
      </div>
    </div>
  );
}
