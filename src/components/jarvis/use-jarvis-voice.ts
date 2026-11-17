"use client";

import { useState, useEffect, useRef } from "react";

export function useJarvisVoice() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;

      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        const ptBrVoice = voices.find(v => v.lang === "pt-BR") || voices.find(v => v.lang.startsWith("pt"));
        voiceRef.current = ptBrVoice || voices[0] || null;
      };

      loadVoices();
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      synthRef.current?.cancel();
    };
  }, []);

  const speak = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!isSupported || !synthRef.current) {
        console.warn("Síntese de voz não suportada");
        resolve();
        return;
      }

      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 1.0;
      utterance.pitch = 0.9;
      utterance.volume = 1.0;

      if (voiceRef.current) {
        utterance.voice = voiceRef.current;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = (error) => {
        console.error("Erro na síntese de voz:", error);
        setIsSpeaking(false);
        resolve();
      };

      synthRef.current.speak(utterance);
    });
  };

  const stop = () => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  };

  return { speak, stop, isSpeaking, isSupported };
}
