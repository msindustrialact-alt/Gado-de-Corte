"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";

interface CommandEntry {
  timestamp: Date;
  command: string;
  response: string;
  type: "success" | "error" | "info";
}

interface JarvisConsoleProps {
  history: CommandEntry[];
}

export function JarvisConsole({ history }: JarvisConsoleProps) {
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="fixed top-20 right-8 w-[400px] max-h-[500px] bg-black/80 border border-accent/30 backdrop-blur-sm rounded overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-accent/30 bg-black/50">
        <Terminal className="w-4 h-4 text-accent" />
        <span className="text-sm font-mono text-accent">CONSOLE DE COMANDOS</span>
      </div>
      
      <div ref={consoleRef} className="p-4 overflow-y-auto max-h-[450px] space-y-3">
        {history.length === 0 ? (
          <div className="text-gray-500 text-sm font-mono">
            &gt; Aguardando comandos...
          </div>
        ) : (
          history.map((entry, index) => (
            <div key={index} className="space-y-1">
              <div className="text-xs text-gray-500 font-mono">
                {entry.timestamp.toLocaleTimeString("pt-BR")}
              </div>
              <div className="text-sm text-accent font-mono">
                &gt; {entry.command}
              </div>
              <div className={`text-sm font-mono pl-4 ${
                entry.type === "success" ? "text-green-400" :
                entry.type === "error" ? "text-red-400" :
                "text-gray-300"
              }`}>
                {entry.response}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
