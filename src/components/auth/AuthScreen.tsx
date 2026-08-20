"use client";

import { useActionState, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { entrar, cadastrarPadrinho, type FormState } from "@/app/(auth)/actions";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff } from "lucide-react";

type Aba = "login" | "cadastro";
type Lado = "PADRINHO" | "PEDAGOGICO" | "PORTAL";

const TEXTOS: Record<Lado, { titulo: string; sub: string; entrar: string }> = {
  PADRINHO: {
    titulo: "Acompanhe seu afilhado\nde perto.",
    sub: "Veja a evolução, a Tábua da Maré e as novidades do seu afilhado ou afilhada.",
    entrar: "Entrar como padrinho(a)",
  },
  PEDAGOGICO: {
    titulo: "Onde cada criança\nencontra um novo mundo.",
    sub: "Matrícula, apadrinhamento, Tábua da Maré e indicadores pedagógicos das crianças.",
    entrar: "Entrar no Pedagógico",
  },
  PORTAL: {
    titulo: "O portal institucional\ndo instituto.",
    sub: "Área interna da gestão e dos núcleos — novidades, tarefas, avisos e solicitações.",
    entrar: "Entrar no Portal",
  },
};

const ACCENT_VAR: Record<Lado, string> = {
  PADRINHO: "var(--imla-pink)",
  PEDAGOGICO: "var(--imla-green)",
  PORTAL: "var(--imla-teal)",
};
const ACCENT_DARK_VAR: Record<Lado, string> = {
  PADRINHO: "#e0568f",
  PEDAGOGICO: "var(--imla-green-dark)",
  PORTAL: "var(--imla-teal-dark)",
};

export function AuthScreen() {
  const [lado, setLado] = useState<Lado>("PADRINHO");
  const [aba, setAba] = useState<Aba>("login");

  const accentStyle = {
    "--imla-accent": ACCENT_VAR[lado],
    "--imla-accent-dark": ACCENT_DARK_VAR[lado],
  } as CSSProperties;

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

          <Link href="/rede-social" className="mt-8 w-fit">
            <GlassCard
              hover
              className="flex items-center gap-3 px-6 py-4 text-white transition"
            >
              <span className="text-2xl">📰</span>
              <span>
                <span className="block text-sm font-black">Ver a Rede Social do instituto</span>
                <span className="block text-xs font-medium text-white/70">
                  Novidades de todos os núcleos, sem precisar de login
                </span>
              </span>
            </GlassCard>
          </Link>
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

          <SeletorDeSistema
            lado={lado}
            onChange={(l) => {
              setLado(l);
              setAba("login");
            }}
          />

          <div className="mt-6 mb-6 flex rounded-full bg-black/5 p-1 dark:bg-white/5">
            <button
              onClick={() => setAba("login")}
              className={`flex-1 rounded-full py-2 text-sm font-bold transition ${
                aba === "login" ? "bg-imla-accent text-white shadow" : "text-foreground/60"
              }`}
            >
              Entrar
            </button>
            {lado === "PADRINHO" && (
              <button
                onClick={() => setAba("cadastro")}
                className={`flex-1 rounded-full py-2 text-sm font-bold transition ${
                  aba === "cadastro" ? "bg-imla-accent text-white shadow" : "text-foreground/60"
                }`}
              >
                Criar conta
              </button>
            )}
          </div>

          {aba === "login" || lado !== "PADRINHO" ? (
            <FormularioLogin lado={lado} />
          ) : (
            <FormularioCadastroPadrinho />
          )}

          {lado !== "PADRINHO" && (
            <p className="mt-5 text-center text-xs font-semibold text-foreground/50">
              Acesso restrito à gestão e aos núcleos do instituto. Contas são criadas
              pela coordenação.
            </p>
          )}

          <div className="mt-6 lg:hidden">
            <Link href="/rede-social">
              <Button type="button" variant="secondary" fullWidth>
                📰 Ver a Rede Social
              </Button>
            </Link>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}

function SeletorDeSistema({ lado, onChange }: { lado: Lado; onChange: (l: Lado) => void }) {
  const opcoes: { key: Lado; label: string }[] = [
    { key: "PADRINHO", label: "💌 Padrinho" },
    { key: "PEDAGOGICO", label: "📚 Pedagógico" },
    { key: "PORTAL", label: "📣 Portal" },
  ];
  const indice = opcoes.findIndex((o) => o.key === lado);

  return (
    <div className="relative flex rounded-full bg-black/5 p-1 dark:bg-white/10">
      <div
        className="absolute inset-y-1 w-[calc(33.333%-4px)] rounded-full bg-imla-accent shadow transition-all duration-300 ease-out"
        style={{ left: `calc(${indice} * 33.333% + 4px)` }}
      />
      {opcoes.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={`relative z-10 flex-1 whitespace-nowrap rounded-full py-2.5 text-[10px] font-extrabold uppercase tracking-normal transition-colors sm:text-xs sm:tracking-wide ${
            lado === o.key ? "text-white" : "text-foreground/60"
          }`}
        >
          {o.label}
        </button>
      ))}
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
