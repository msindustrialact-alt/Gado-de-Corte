import type { Metadata } from "next";
import Image from "next/image";

import { LoginForm } from "@/components/login/login-form";

import "./login.css";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse o sistema de gestão pecuária das Fazendas Joana e Cataguá.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Gado Corte",
  },
};

function EscudoCadeado() {
  return (
    <svg
      className="login-shield"
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M17 4.2 28 8.4v8.2c0 7.1-4.6 11.8-11 13.6-6.4-1.8-11-6.5-11-13.6V8.4L17 4.2Z"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <rect
        x="12.6"
        y="16.2"
        width="8.8"
        height="6.6"
        rx="1.3"
        stroke="#ffffff"
        strokeWidth="1.5"
      />
      <path
        d="M14.6 16.2v-1.7a2.4 2.4 0 0 1 4.8 0v1.7"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <main className="login-page">
      <div className="login-stage" aria-hidden>
        <Image
          src="/images/login-bg-v3.jpg"
          alt=""
          fill
          priority
          quality={85}
          sizes="100vw"
          className="login-bg"
        />
      </div>

      <div className="login-panel">
        <Image
          src="/images/logo.png"
          alt="Grupo Consociados – Fazendas Joana e Cataguá"
          width={1619}
          height={971}
          priority
          quality={90}
          className="login-logo"
        />

        <section className="login-card">
          <LoginForm />
        </section>
      </div>

      <p className="login-mid-right">
        Pecuária
        <br />
        com gestão
        <br />
        gera grandes
        <br />
        resultados
        <span className="login-mid-right-rule" />
      </p>

      <div className="login-top-right">
        <p className="login-top-kicker">Sistema de gestão pecuária</p>
        <p className="login-top-name">Fazendas Joana e Cataguá</p>
        <span className="login-top-rule" />
      </div>

      <div className="login-footer-left">
        <p className="login-footer-block">
          <span className="login-footer-title">Fazendas Joana e Cataguá</span>
        </p>
        <span className="login-footer-divider" />
        <p className="login-footer-block">
          <span className="login-footer-italic">Tradição no campo</span>
          <span className="login-footer-italic">Visão no futuro</span>
        </p>
      </div>

      <div className="login-footer-right">
        <div className="login-footer-secure">
          <EscudoCadeado />
          <p className="login-footer-secure-text">
            Seus dados
            <br />
            sempre protegidos
          </p>
        </div>
        <span className="login-footer-right-rule" />
      </div>
    </main>
  );
}
