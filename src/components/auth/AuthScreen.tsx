"use client";

import { useActionState, useState, type CSSProperties } from "react";
import Image from "next/image";
import {
  entrar,
  cadastrar,
  cadastrarPadrinho,
  entrarComoVisitante,
  type FormState,
} from "@/app/(auth)/actions";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { NUCLEOS } from "@/lib/config";
import { Eye, EyeOff } from "lucide-react";

type Aba = "login" | "cadastro";
type Lado = "INTRANET" | "PEDAGOGICO";

const TEXTOS: Record<Lado, { titulo: string; sub: string; entrar: string }> = {
  INTRANET: {
    titulo: "A intranet dos núcleos.",
    sub: "Novidades, tarefas, avisos e solicitações de cada núcleo do instituto, em um só lugar.",
    entrar: "Entrar na Intranet",
  },
  PEDAGOGICO: {
    titulo: "Onde cada criança\nencontra um novo mundo.",
    sub: "Matrícula, apadrinhamento, Tábua da Maré e indicadores pedagógicos das crianças.",
    entrar: "Entrar no Pedagógico",
  },
};

export function AuthScreen() {
  const [lado, setLado] = useState<Lado>("INTRANET");
  const [aba, setAba] = useState<Aba>("login");

  const accentStyle = (
    lado === "PEDAGOGICO"
      ? { "--imla-accent": "var(--imla-green)", "--imla-accent-dark": "var(--imla-green-dark)" }
      : { "--imla-accent": "var(--imla-teal)", "--imla-accent-dark": "var(--imla-teal-dark)" }
  ) as CSSProperties;

  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 -z-10">
        <Image src="/images/hero-2.jpg" alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1f24]/70 via-[#0b1f24]/60 to-[#0b1f24]/85" />
      </div>

      <div className="flex w-full max-w-5xl flex-col items-center gap-10 lg:flex-row lg:items-stretch lg:gap-16">
        <div className="hidden flex-1 flex-col justify-end text-white lg:flex">
          <h1 className="whitespace-pre-line text-4xl font-black leading-tight drop-shadow-lg">
            {TEXTOS[lado].titulo}
          </h1>
          <p className="mt-4 max-w-md text-base font-medium text-white/85 drop-shadow">
            {TEXTOS[lado].sub}
          </p>
        </div>

        <GlassCard strong className="w-full max-w-md p-8 sm:p-10" style={accentStyle}>
          <div className="mb-6 flex justify-center">
            <Image
              src="/images/logo.png"
              alt="Instituto Mãe Lalu"
              width={220}
              height={70}
              priority
              className="h-auto w-48"
            />
          </div>

          <SeletorDeSistema lado={lado} onChange={setLado} />

          <div className="mt-6 mb-6 flex rounded-full bg-black/5 p-1 dark:bg-white/5">
            <button
              onClick={() => setAba("login")}
              className={`flex-1 rounded-full py-2 text-sm font-bold transition ${
                aba === "login" ? "bg-imla-accent text-white shadow" : "text-foreground/60"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setAba("cadastro")}
              className={`flex-1 rounded-full py-2 text-sm font-bold transition ${
                aba === "cadastro" ? "bg-imla-accent text-white shadow" : "text-foreground/60"
              }`}
            >
              Criar conta
            </button>
          </div>

          {aba === "login" ? (
            <FormularioLogin lado={lado} />
          ) : lado === "INTRANET" ? (
            <FormularioCadastroNucleo />
          ) : (
            <FormularioCadastroPadrinho />
          )}

          {lado === "INTRANET" && (
            <>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-foreground/10" />
                <span className="text-[11px] font-bold uppercase tracking-wide text-foreground/40">
                  ou
                </span>
                <div className="h-px flex-1 bg-foreground/10" />
              </div>

              <form action={entrarComoVisitante} className="mt-4">
                <Button type="submit" variant="secondary" fullWidth>
                  👁️ Entrar como visitante
                </Button>
              </form>
            </>
          )}

          {lado === "PEDAGOGICO" && aba === "login" && (
            <p className="mt-5 text-center text-xs font-semibold text-foreground/50">
              Acesso da coordenação e dos padrinhos/madrinhas.
            </p>
          )}
        </GlassCard>
      </div>
    </main>
  );
}

function SeletorDeSistema({ lado, onChange }: { lado: Lado; onChange: (l: Lado) => void }) {
  return (
    <div className="relative flex rounded-full bg-black/5 p-1 dark:bg-white/10">
      <div
        className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-imla-accent shadow transition-all duration-300 ease-out"
        style={{ left: lado === "INTRANET" ? "4px" : "calc(50% + 0px)" }}
      />
      <button
        type="button"
        onClick={() => onChange("INTRANET")}
        className={`relative z-10 flex-1 rounded-full py-2.5 text-xs font-extrabold uppercase tracking-wide transition-colors ${
          lado === "INTRANET" ? "text-white" : "text-foreground/60"
        }`}
      >
        📣 Intranet
      </button>
      <button
        type="button"
        onClick={() => onChange("PEDAGOGICO")}
        className={`relative z-10 flex-1 rounded-full py-2.5 text-xs font-extrabold uppercase tracking-wide transition-colors ${
          lado === "PEDAGOGICO" ? "text-white" : "text-foreground/60"
        }`}
      >
        📚 Pedagógico
      </button>
    </div>
  );
}

function FormularioLogin({ lado }: { lado: Lado }) {
  const [state, action, pending] = useActionState<FormState, FormData>(entrar, null);
  const [verSenha, setVerSenha] = useState(false);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="destino" value={lado} />
      <Campo label="E-mail" name="email" type="email" placeholder="voce@email.com" />
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-foreground/70">Senha</label>
        <div className="relative">
          <input
            name="senha"
            type={verSenha ? "text" : "password"}
            required
            className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 pr-11 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
          />
          <button
            type="button"
            onClick={() => setVerSenha((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40"
          >
            {verSenha ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {state?.erro && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-500">
          {state.erro}
        </p>
      )}

      <Button type="submit" disabled={pending} fullWidth className="mt-1">
        {pending ? "Entrando..." : TEXTOS[lado].entrar}
      </Button>
    </form>
  );
}

function FormularioCadastroNucleo() {
  const [state, action, pending] = useActionState<FormState, FormData>(cadastrar, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Campo label="Nome completo" name="nome" type="text" placeholder="Seu nome" />
      <Campo label="E-mail" name="email" type="email" placeholder="voce@email.com" />
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-foreground/70">Núcleo que pertence</label>
        <select
          name="nucleo"
          required
          className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
        >
          {Object.entries(NUCLEOS).map(([key, n]) => (
            <option key={key} value={key}>
              {n.icon} {n.label}
            </option>
          ))}
        </select>
      </div>
      <Campo label="Senha" name="senha" type="password" placeholder="••••••" />
      <Campo
        label="Confirmar senha"
        name="confirmarSenha"
        type="password"
        placeholder="••••••"
      />

      {state?.erro && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-500">
          {state.erro}
        </p>
      )}

      <Button type="submit" disabled={pending} fullWidth className="mt-1">
        {pending ? "Criando conta..." : "Finalizar cadastro"}
      </Button>
    </form>
  );
}

function FormularioCadastroPadrinho() {
  const [state, action, pending] = useActionState<FormState, FormData>(cadastrarPadrinho, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Campo label="Nome completo" name="nome" type="text" placeholder="Seu nome" />
      <Campo label="E-mail" name="email" type="email" placeholder="voce@email.com" />
      <Campo label="Senha" name="senha" type="password" placeholder="••••••" />
      <Campo
        label="Confirmar senha"
        name="confirmarSenha"
        type="password"
        placeholder="••••••"
      />

      {state?.erro && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-500">
          {state.erro}
        </p>
      )}

      <Button type="submit" disabled={pending} fullWidth className="mt-1">
        {pending ? "Criando conta..." : "Finalizar cadastro"}
      </Button>

      <p className="text-center text-xs font-semibold text-foreground/50">
        Depois de criar a conta, avise a coordenação para vincular seu afilhado ou
        afilhada ao seu e-mail.
      </p>
    </form>
  );
}

function Campo({
  label,
  name,
  type,
  placeholder,
}: {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-foreground/70">{label}</label>
      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
      />
    </div>
  );
}
