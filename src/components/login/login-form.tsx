"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createClient } from "@/lib/supabase/client";

const schemaLogin = z.object({
  email: z.email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe a senha."),
  lembrar: z.boolean(),
});

type DadosLogin = z.infer<typeof schemaLogin>;

export function LoginForm() {
  const router = useRouter();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DadosLogin>({
    resolver: zodResolver(schemaLogin),
    defaultValues: {
      email: "",
      senha: "",
      lembrar: false,
    },
  });

  async function onSubmit(dados: DadosLogin) {
    setErroGeral(null);
    setMensagem(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: dados.email,
      password: dados.senha,
    });

    if (error) {
      setErroGeral("E-mail ou senha inválidos.");
      return;
    }

    void dados.lembrar;
    router.replace("/dashboard");
    router.refresh();
  }

  async function recuperarSenha() {
    setErroGeral(null);
    setMensagem(null);

    const email = getValues("email");
    const resultado = z.email().safeParse(email);

    if (!resultado.success) {
      setError("email", {
        message: "Informe um e-mail válido para recuperar a senha.",
      });
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      setErroGeral("Não foi possível enviar a recuperação de senha.");
      return;
    }

    setMensagem("Se o e-mail existir, enviaremos as instruções.");
  }

  return (
    <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <h1 className="login-title">Acesse sua conta</h1>
      <p className="login-subtitle">
        Gestão, controle e resultados
        <br />
        para uma pecuária mais forte.
      </p>

      <div className="login-field login-field-email">
        <Mail className="login-field-icon" aria-hidden />
        <input
          className="login-input"
          type="email"
          autoComplete="email"
          placeholder="E-mail"
          aria-invalid={errors.email ? true : undefined}
          {...register("email")}
        />
      </div>
      {errors.email ? (
        <p className="login-alert">{errors.email.message}</p>
      ) : null}

      <div className="login-field login-field-senha">
        <Lock className="login-field-icon" aria-hidden />
        <input
          className="login-input login-input-senha"
          type={mostrarSenha ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Senha"
          aria-invalid={errors.senha ? true : undefined}
          {...register("senha")}
        />
        <button
          className="login-eye"
          type="button"
          aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
          onClick={() => setMostrarSenha((atual) => !atual)}
        >
          {mostrarSenha ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
        </button>
      </div>
      {errors.senha ? (
        <p className="login-alert">{errors.senha.message}</p>
      ) : null}

      <div className="login-row">
        <label className="login-lembrar">
          <input type="checkbox" className="login-check" {...register("lembrar")} />
          Lembrar de mim
        </label>
        <button className="login-forgot" type="button" onClick={recuperarSenha}>
          Esqueceu sua senha?
        </button>
      </div>

      {erroGeral ? (
        <p className="login-alert" role="alert">
          {erroGeral}
        </p>
      ) : null}
      {mensagem ? (
        <p className="login-ok" role="status">
          {mensagem}
        </p>
      ) : null}

      <button className="login-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? <span className="login-spinner" /> : null}
        {isSubmitting ? "Entrando" : "Entrar"}
        {isSubmitting ? null : <ArrowRight className="login-submit-icon" aria-hidden />}
      </button>
    </form>
  );
}
