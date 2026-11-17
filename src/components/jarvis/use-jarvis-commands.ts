"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getFazendaAtiva } from "@/lib/fazenda";

interface CommandEntry {
  timestamp: Date;
  command: string;
  response: string;
  type: "success" | "error" | "info";
}

export function useJarvisCommands() {
  const [commandHistory, setCommandHistory] = useState<CommandEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("fazendas").select("id").limit(1);
        setIsConnected(!error);
      } catch {
        setIsConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const addToHistory = (command: string, response: string, type: CommandEntry["type"] = "info") => {
    setCommandHistory(prev => [
      ...prev,
      {
        timestamp: new Date(),
        command,
        response,
        type,
      },
    ].slice(-10)); // Mantém apenas os últimos 10
  };

  const processCommand = async (command: string): Promise<string> => {
    const lowerCommand = command.toLowerCase();

    try {
      // Comandos de consulta
      if (
        lowerCommand.includes("quantos") &&
        (lowerCommand.includes("animal") || lowerCommand.includes("boi") || lowerCommand.includes("gado"))
      ) {
        const count = await countAnimals();
        const response = `Você possui ${count} animais ativos na fazenda, senhor.`;
        addToHistory(command, response, "success");
        return response;
      }

      if (lowerCommand.includes("quantos") && lowerCommand.includes("lote")) {
        const count = await countLotes();
        const response = `Existem ${count} lotes ativos na propriedade, senhor.`;
        addToHistory(command, response, "success");
        return response;
      }

      if (lowerCommand.includes("peso médio") || lowerCommand.includes("peso medio")) {
        const peso = await getAveragePeso();
        const response = peso 
          ? `O peso médio atual do rebanho é ${peso} quilogramas, senhor.`
          : `Não há dados de peso disponíveis no momento, senhor.`;
        addToHistory(command, response, peso ? "success" : "info");
        return response;
      }

      if (
        lowerCommand.includes("resumo") ||
        lowerCommand.includes("status") ||
        lowerCommand.includes("relatório") ||
        lowerCommand.includes("relatorio")
      ) {
        const summary = await getSystemSummary();
        addToHistory(command, summary, "success");
        return summary;
      }

      if (lowerCommand.includes("vacinação") || lowerCommand.includes("vacinacao") || lowerCommand.includes("vacina")) {
        const response = "Verificando pendências de vacinação no sistema, senhor.";
        addToHistory(command, response, "info");
        return response;
      }

      // Comandos de navegação
      if (lowerCommand.includes("abrir") || lowerCommand.includes("ir para")) {
        if (lowerCommand.includes("dashboard") || lowerCommand.includes("painel")) {
          const response = "Abrindo dashboard principal, senhor.";
          addToHistory(command, response, "info");
          setTimeout(() => window.location.href = "/dashboard", 1000);
          return response;
        }
        if (lowerCommand.includes("animais")) {
          const response = "Acessando gestão de animais, senhor.";
          addToHistory(command, response, "info");
          setTimeout(() => window.location.href = "/animais", 1000);
          return response;
        }
      }

      // Comando desconhecido
      const response = "Desculpe, senhor. Não entendi este comando. Posso ajudá-lo com informações sobre animais, lotes, peso médio ou status geral do sistema.";
      addToHistory(command, response, "info");
      return response;

    } catch (error) {
      console.error("Erro ao processar comando:", error);
      const response = "Ocorreu um erro ao processar seu comando, senhor. Verificando sistemas.";
      addToHistory(command, response, "error");
      return response;
    }
  };

  // Funções auxiliares de consulta
  const countAnimals = async (): Promise<number> => {
    const fazenda = await getFazendaAtiva();
    if (!fazenda) return 0;

    const supabase = createClient();
    const { count } = await supabase
      .from("animais")
      .select("id", { count: "exact", head: true })
      .eq("fazenda_id", fazenda.id)
      .eq("status", "ativo")
      .is("deleted_at", null);

    return count || 0;
  };

  const countLotes = async (): Promise<number> => {
    const fazenda = await getFazendaAtiva();
    if (!fazenda) return 0;

    const supabase = createClient();
    const { count } = await supabase
      .from("lotes")
      .select("id", { count: "exact", head: true })
      .eq("fazenda_id", fazenda.id)
      .eq("status", "ativo")
      .is("deleted_at", null);

    return count || 0;
  };

  const getAveragePeso = async (): Promise<number | null> => {
    const fazenda = await getFazendaAtiva();
    if (!fazenda) return null;

    const supabase = createClient();
    const { data } = await supabase
      .from("animais")
      .select("peso_atual")
      .eq("fazenda_id", fazenda.id)
      .eq("status", "ativo")
      .not("peso_atual", "is", null)
      .is("deleted_at", null);

    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, animal) => sum + (animal.peso_atual || 0), 0);
    return Math.round(total / data.length);
  };

  const getSystemSummary = async (): Promise<string> => {
    const [animais, lotes, peso] = await Promise.all([
      countAnimals(),
      countLotes(),
      getAveragePeso(),
    ]);

    return `Status dos sistemas: Operacional. ${animais} animais ativos distribuídos em ${lotes} lotes. Peso médio do rebanho: ${peso ? `${peso} quilogramas` : "não disponível"}. Todos os sistemas funcionando normalmente, senhor.`;
  };

  return {
    processCommand,
    commandHistory,
    isConnected,
  };
}
