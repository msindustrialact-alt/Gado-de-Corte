import type { Metadata } from "next";
import Image from "next/image";

import { LoginForm } from "@/components/login/login-form";

import "./login.css";

export const metadata: Metadata = {
  title: "Entrar | Fazenda Joana",
  description: "Acesse o sistema de gestão pecuária da Fazenda Joana.",
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
      <div className="login-stage">
        <Image
          src="/images/login-bg-v2.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="login-bg"
        />

        <Image
          src="/images/logo.png"
          alt="Fazenda Joana – Serra Joana"
          width={476}
          height={170}
          priority
          className="login-logo"
        />

        <section className="login-card">
          <LoginForm />
        </section>

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
      </div>

      <div className="login-top-right">
        <p className="login-top-kicker">Sistema de gestão pecuária</p>
        <p className="login-top-name">Fazenda Joana</p>
        <span className="login-top-rule" />
      </div>

      <div className="login-footer-left">
        <Image
          src="/images/icone-boi.svg"
          alt=""
          width={60}
          height={40}
          className="login-footer-icon"
        />
        <span className="login-footer-divider" />
        <p className="login-footer-block">
          <span className="login-footer-title">Fazenda Joana</span>
          <span className="login-footer-sub">Serra Joana</span>
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
