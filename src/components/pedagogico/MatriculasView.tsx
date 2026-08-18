"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SALAS, type SalaKey } from "@/lib/config";
import {
  matricularAluno,
  definirPadrinho,
  matricularTurnoEstendido,
} from "@/app/painel/pedagogico/actions";

type Aluno = {
  id: string;
  nome: string;
  idade: number | null;
  comunidade: string | null;
  turma: string | null;
  sala: SalaKey;
  padrinho: string | null;
  matriculaTurnoEstendido: { id: string } | null;
};

export function MatriculasView({ alunos }: { alunos: Aluno[] }) {
  const [salaAtual, setSalaAtual] = useState<SalaKey>("ROSA");
  const [painelAberto, setPainelAberto] = useState<
    "nenhum" | "matricula" | "padrinho" | "turno"
  >("nenhum");

  const alunosDaSala = alunos.filter((a) => a.sala === salaAtual);
  const semPadrinho = alunosDaSala.filter((a) => !a.padrinho);
  const semTurnoEstendido = alunos.filter((a) => !a.matriculaTurnoEstendido);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <PainelBotao
          label="➕ Matrícula"
          ativo={painelAberto === "matricula"}
          onClick={() => setPainelAberto((p) => (p === "matricula" ? "nenhum" : "matricula"))}
        />
        <PainelBotao
          label="🤝 Padrinho/Madrinha"
          ativo={painelAberto === "padrinho"}
          onClick={() => setPainelAberto((p) => (p === "padrinho" ? "nenhum" : "padrinho"))}
        />
        <PainelBotao
          label="⏳ Turno Estendido"
          ativo={painelAberto === "turno"}
          onClick={() => setPainelAberto((p) => (p === "turno" ? "nenhum" : "turno"))}
        />
      </div>

      {painelAberto === "matricula" && (
        <GlassCard className="p-5">
          <p className="mb-3 font-extrabold">📝 Nova Matrícula</p>
          <form action={matricularAluno} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              name="nome"
              required
              placeholder="Nome do aluno"
              className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none dark:bg-white/5"
            />
            <select
              name="sala"
              defaultValue={salaAtual}
              className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none dark:bg-white/5"
            >
              {Object.entries(SALAS).map(([key, s]) => (
                <option key={key} value={key}>
                  {s.icon} {s.label}
                </option>
              ))}
            </select>
            <input
              name="idade"
              type="number"
              placeholder="Idade"
              className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none dark:bg-white/5"
            />
            <input
              name="comunidade"
              placeholder="Comunidade"
              className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none dark:bg-white/5"
            />
            <input
              name="turma"
              placeholder="Turma (ex: Manhã, Tarde)"
              className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none dark:bg-white/5"
            />
            <Button type="submit" className="sm:col-span-2">
              Salvar novo aluno
            </Button>
          </form>
        </GlassCard>
      )}

      {painelAberto === "padrinho" && (
        <GlassCard className="p-5">
          <p className="mb-3 font-extrabold">🤝 Novo Apadrinhamento</p>
          {semPadrinho.length === 0 ? (
            <p className="text-sm text-foreground/60">
              Todos os alunos da {SALAS[salaAtual].label} já têm padrinho/madrinha.
            </p>
          ) : (
            <form action={definirPadrinho} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <select
                name="alunoId"
                required
                className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none dark:bg-white/5"
              >
                {semPadrinho.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
              <input
                name="padrinho"
                required
                placeholder="Nome do padrinho/madrinha"
                className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none dark:bg-white/5"
              />
              <div className="sm:col-span-2">
                <p className="mb-2 text-xs font-bold text-foreground/50">
                  Opcional: criar acesso ao Canal do Apadrinhamento
                </p>
              </div>
              <input
                name="email"
                type="email"
                placeholder="E-mail do padrinho/madrinha"
                className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none dark:bg-white/5"
              />
              <input
                name="senha"
                type="password"
                placeholder="Senha de acesso"
                className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none dark:bg-white/5"
              />
              <Button type="submit" className="sm:col-span-2">
                Confirmar apadrinhamento
              </Button>
            </form>
          )}
        </GlassCard>
      )}

      {painelAberto === "turno" && (
        <GlassCard className="p-5">
          <p className="mb-3 font-extrabold">⏳ Matricular no Turno Estendido</p>
          {semTurnoEstendido.length === 0 ? (
            <p className="text-sm text-foreground/60">
              Todos os alunos já estão matriculados no Turno Estendido.
            </p>
          ) : (
            <form action={matricularTurnoEstendido} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <select
                name="alunoId"
                required
                className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none dark:bg-white/5"
              >
                {semTurnoEstendido.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome} · {SALAS[a.sala].label}
                  </option>
                ))}
              </select>
              <Button type="submit">✅ Confirmar matrícula</Button>
            </form>
          )}
        </GlassCard>
      )}

      <div className="flex flex-wrap gap-2">
        {Object.entries(SALAS).map(([key, s]) => (
          <button key={key} onClick={() => setSalaAtual(key as SalaKey)}>
            <GlassCard
              hover
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold ${
                key === salaAtual ? "ring-2 ring-imla-accent" : ""
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </GlassCard>
          </button>
        ))}
      </div>

      <GlassCard className="overflow-x-auto p-0">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr style={{ backgroundColor: SALAS[salaAtual].cor }} className="text-left text-white">
              <th className="p-3 font-extrabold">Aluno</th>
              <th className="p-3 font-extrabold">Turma</th>
              <th className="p-3 font-extrabold">Idade</th>
              <th className="p-3 font-extrabold">Comunidade</th>
              <th className="p-3 font-extrabold">Padrinho/Madrinha</th>
            </tr>
          </thead>
          <tbody>
            {alunosDaSala.map((a) => (
              <tr key={a.id} className="border-t border-foreground/10">
                <td className="p-3 font-bold">
                  {a.nome}
                  {a.matriculaTurnoEstendido && (
                    <span title="Turno Estendido" className="ml-2">
                      📖
                    </span>
                  )}
                </td>
                <td className="p-3">{a.turma ?? "-"}</td>
                <td className="p-3">{a.idade ?? "-"}</td>
                <td className="p-3">{a.comunidade ?? "-"}</td>
                <td className="p-3 font-semibold">{a.padrinho ?? "-"}</td>
              </tr>
            ))}
            {alunosDaSala.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-foreground/50">
                  A {SALAS[salaAtual].label} ainda não possui alunos matriculados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}

function PainelBotao({
  label,
  ativo,
  onClick,
}: {
  label: string;
  ativo: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick}>
      <GlassCard
        hover
        className={`px-4 py-3 text-center text-sm font-bold ${ativo ? "ring-2 ring-imla-accent" : ""}`}
      >
        {label}
      </GlassCard>
    </button>
  );
}
