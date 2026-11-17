"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Activity, Database, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JarvisVisualizer } from "./jarvis-visualizer";
import { JarvisHUD } from "./jarvis-hud";
import { JarvisConsole } from "./jarvis-console";
import { useJarvisVoice } from "./use-jarvis-voice";
import { useJarvisCommands } from "./use-jarvis-commands";

export function JarvisInterface() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [systemStatus, setSystemStatus] = useState<"online" | "offline" | "processing">("online");
  
  const { speak, isSpeaking } = useJarvisVoice();
  const { processCommand, commandHistory, isConnected } = useJarvisCommands();

  useEffect(() => {
    setSystemStatus(isConnected ? "online" : "offline");
  }, [isConnected]);

  useEffect(() => {
    if (isProcessing || isSpeaking) {
      setSystemStatus("processing");
    } else if (isConnected) {
      setSystemStatus("online");
    }
  }, [isProcessing, isSpeaking, isConnected]);

  const handleVoiceCommand = async (transcript: string) => {
    setIsListening(false);
    setIsProcessing(true);

    try {
      const response = await processCommand(transcript);
      await speak(response);
    } catch (error) {
      console.error("Erro ao processar comando:", error);
      await speak("Desculpe, encontrei um erro ao processar seu comando.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = async () => {
    if (isListening) {
      setIsListening(false);
      recognition?.stop();
    } else {
      setIsListening(true);
      await startListening();
    }
  };

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = "pt-BR";
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceCommand(transcript);
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Erro de reconhecimento:", event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognitionInstance;
      setRecognition(recognitionInstance);
    }

    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const startListening = async () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        await speak("Estou ouvindo, senhor.");
      }
    } catch (error) {
      console.error("Erro ao iniciar reconhecimento:", error);
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (isListening || isSpeaking) {
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 50);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [isListening, isSpeaking]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Grid de fundo */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(47, 227, 154, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(47, 227, 154, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Efeitos de luz */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary-action/10 rounded-full blur-[120px]" />
      </div>

      {/* Conteúdo principal */}
      <div className="relative h-full flex flex-col items-center justify-center p-8">
        {/* Header com status */}
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="flex items-center gap-2 text-accent font-mono text-sm">
            <Database className="w-4 h-4" />
            <span>SUPABASE</span>
            <Wifi className={`w-4 h-4 ${isConnected ? "text-accent" : "text-red-500"}`} />
          </div>
        </div>

        <div className="absolute top-8 right-8">
          <div className="flex items-center gap-2 text-accent font-mono text-sm">
            <Activity className="w-4 h-4" />
            <span>SISTEMA: </span>
            <span className={`uppercase ${
              systemStatus === "online" ? "text-accent" :
              systemStatus === "offline" ? "text-red-500" :
              "text-yellow-500"
            }`}>
              {systemStatus}
            </span>
          </div>
        </div>

        {/* Visualizador central */}
        <div className="mb-8">
          <JarvisVisualizer 
            isActive={isListening || isSpeaking || isProcessing}
            level={audioLevel}
            status={systemStatus}
          />
        </div>

        {/* Nome do sistema */}
        <div className="mb-6 text-center">
          <h1 className="text-5xl font-bold text-accent mb-2 tracking-widest" style={{ fontFamily: "monospace" }}>
            J.A.R.V.I.S
          </h1>
          <p className="text-sm text-gray-400 tracking-[0.3em] uppercase">
            Just A Rather Very Intelligent System
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Sistema de Gestão Pecuária - Fazenda Joana
          </p>
        </div>

        {/* Status de escuta */}
        {isListening && (
          <div className="mb-6 text-accent text-lg font-mono animate-pulse">
            &gt; Aguardando comando...
          </div>
        )}

        {isProcessing && (
          <div className="mb-6 text-yellow-500 text-lg font-mono animate-pulse">
            &gt; Processando requisição...
          </div>
        )}

        {isSpeaking && (
          <div className="mb-6 text-primary-action text-lg font-mono animate-pulse">
            &gt; Respondendo...
          </div>
        )}

        {/* Botão principal */}
        <Button
          onClick={toggleListening}
          disabled={isProcessing || isSpeaking}
          size="lg"
          className={`
            relative w-20 h-20 rounded-full border-2 transition-all duration-300
            ${isListening 
              ? "bg-accent border-accent shadow-[0_0_30px_rgba(47,227,154,0.5)]" 
              : "bg-transparent border-accent hover:bg-accent/10 hover:shadow-[0_0_20px_rgba(47,227,154,0.3)]"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isListening ? (
            <MicOff className="w-8 h-8 text-black" />
          ) : (
            <Mic className="w-8 h-8 text-accent" />
          )}
        </Button>

        <p className="mt-4 text-sm text-gray-400">
          {isListening ? "Clique para parar" : "Clique para falar"}
        </p>

        {/* HUD de dados */}
        <JarvisHUD />

        {/* Console de comandos */}
        <JarvisConsole history={commandHistory} />
      </div>

      {/* Linhas decorativas */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-accent/50 to-transparent" />
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-accent/50 to-transparent" />
    </div>
  );
}
