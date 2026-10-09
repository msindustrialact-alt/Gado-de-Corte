"use client";

import { useEffect } from "react";

export function RegistrarPwa() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    const registrar = () => {
      void navigator.serviceWorker.register("/sw.js").catch(() => {
        // Instalação PWA é opcional — falha silenciosa
      });
    };

    if (document.readyState === "complete") {
      registrar();
    } else {
      window.addEventListener("load", registrar, { once: true });
    }
  }, []);

  return null;
}
