"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { WaveIndicator } from "@/components/ui/WaveIndicator";
import { Select } from "@/components/ui/Select";
import {
  NIVEIS_ALFABETIZACAO,
  EVIDENCIAS_POR_NIVEL,
  SALAS,
  type SalaKey,
  type NivelAlfabetizacaoKey,
} from "@/lib/config";
import { salvarAvaliacaoAlfabetizacao } from "@/app/painel/pedagogico/actions";

type Avaliacao = {
  id: string;
  ano: number;
  etapa: "PRIMEIRA" | "SEGUNDA" | "FINAL";
  nivel: NivelAlfabetizacaoKey;
  evidencias: string[];
  observacoes: string | null;
};

type Aluno = {
  id: string;
  nome: string;
  sala: SalaKey;
  avaliacoesAlfabetizacao: Avaliacao[];
};

const ETAPA_LABEL: Record<Avaliacao["etapa"], string> = {
  PRIMEIRA: "1ª Avaliação",
  SEGUNDA: "2ª Avaliação",
  FINAL: "Avaliação Final",
};

function nivelInfo(key: NivelAlfabetizacaoKey) {
  return NIVEIS_ALFABETIZACAO.find((n) => n.key === key)!;
}

export function TurnoEstendidoView({ alunos }: { alunos: Aluno[] }) {
  const [busca, setBusca] = useState("");
  const [alunoSelId, setAlunoSelId] = useState<string | null>(null);

  const filtrados = alunos.filter((a) =>
    a.nome.toLowerCase().includes(busca.toLowerCase())
  );
  const alunoSel = alunos.find((a) => a.id === alunoSelId);

  const ultimaAvaliacao = alunoSel?.avaliacoesAlfabetizacao.at(-1);

  return (
    <div className="flex flex-col gap-6">
      <GlassCard className="p-5">
        <p className="mb-3 font-extrabold">🔍 Localizar Aluno</p>
        <input
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setAlunoSelId(null);
          }}
          placeholder="Digite o nome para buscar..."
          className="w-full max-w-md rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none dark:bg-white/5"
        />

        {busca && (
          <div className="mt-3 flex flex-col gap-1">
            {filtrados.slice(0, 8).map((a) => (
              <button
                key={a.id}
                onClick={() => setAlunoSelId(a.id)}
                className={`rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10 ${
                  alunoSelId === a.id ? "bg-imla-accent/10" : ""
                }`}
              >
                {a.nome} · {SALAS[a.sala].label}
              </button>
            ))}
            {filtrados.length === 0 && (
              <p className="px-3 py-2 text-sm text-foreground/50">Nenhum aluno encontrado.</p>
            )}
          </div>
        )}
      </GlassCard>

      {alunoSel && (
        <>
          <GlassCard className="flex flex-wrap items-center gap-5 p-5">
            <WaveIndicator
              percent={
                ultimaAvaliacao
                  ? ((NIVEIS_ALFABETIZACAO.findIndex((n) => n.key === ultimaAvaliacao.nivel) + 1) / 7) * 100
                  : 4
              }
              size="lg"
              sublabel="status maré"
            />
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <p className="text-lg font-extrabold">{alunoSel.nome}</p>
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-extrabold uppercase text-white"
                  style={{ backgroundColor: SALAS[alunoSel.sala].cor }}
                >
                  {SALAS[alunoSel.sala].label}
                </span>
              </div>
              {ultimaAvaliacao ? (
                <p className="text-sm">
                  Diagnóstico atual:{" "}
                  <span
                    className="rounded-full px-3 py-1 text-xs font-extrabold"
                    style={{ backgroundColor: nivelInfo(ultimaAvaliacao.nivel).cor }}
                  >
                    {nivelInfo(ultimaAvaliacao.nivel).label}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-foreground/50">Sem registro de diagnóstico ainda.</p>
              )}
            </div>
          </GlassCard>

          <GlassCard className="overflow-x-auto p-5">
            <p className="mb-3 font-extrabold">🚀 Trilha de desenvolvimento</p>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {alunoSel.avaliacoesAlfabetizacao.map((av, i) => (
                <div key={av.id} className="flex items-center gap-2">
                  <div
                    className="min-w-[140px] rounded-xl p-3 text-center text-xs font-extrabold"
                    style={{ backgroundColor: nivelInfo(av.nivel).cor }}
                  >
                    <p className="text-[10px] uppercase opacity-70">
                      {av.ano} · {ETAPA_LABEL[av.etapa]}
                    </p>
                    <p className="mt-1">{nivelInfo(av.nivel).label}</p>
                  </div>
                  {i < alunoSel.avaliacoesAlfabetizacao.length - 1 && (
                    <span className="text-xl text-foreground/30">→</span>
                  )}
                </div>
              ))}
              {alunoSel.avaliacoesAlfabetizacao.length === 0 && (
                <p className="text-sm text-foreground/50">Sem avaliações suficientes para formar a trilha.</p>
              )}
            </div>
          </GlassCard>

          <NovaAvaliacaoForm alunoId={alunoSel.id} />
        </>
      )}
    </div>
  );
}

function NovaAvaliacaoForm({ alunoId }: { alunoId: string }) {
  const [nivel, setNivel] = useState<NivelAlfabetizacaoKey>("PRE_SILABICO");
  const evidencias = EVIDENCIAS_POR_NIVEL[nivel];

  return (
    <GlassCard className="p-5">
      <p className="mb-3 font-extrabold">📝 Critérios de Avaliação</p>
      <form action={salvarAvaliacaoAlfabetizacao} className="flex flex-col gap-4">
        <input type="hidden" name="alunoId" value={alunoId} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            name="ano"
            defaultValue="2026"
            options={[
              { value: "2026", label: "2026" },
              { value: "2025", label: "2025" },
            ]}
          />
          <Select
            name="etapa"
            defaultValue="PRIMEIRA"
            options={[
              { value: "PRIMEIRA", label: "1ª Avaliação" },
              { value: "SEGUNDA", label: "2ª Avaliação" },
              { value: "FINAL", label: "Avaliação Final" },
            ]}
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-extrabold uppercase text-foreground/50">
            Nível de Diagnóstico
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {NIVEIS_ALFABETIZACAO.map((n) => (
              <button
                key={n.key}
                type="button"
                onClick={() => setNivel(n.key)}
                className="rounded-xl border-2 p-2 text-[11px] font-extrabold transition"
                style={{
                  backgroundColor: n.cor,
                  borderColor: nivel === n.key ? "#1d1d1f" : "transparent",
                }}
              >
                {n.label}
              </button>
            ))}
          </div>
          <input type="hidden" name="nivel" value={nivel} />
        </div>

        <div>
          <p className="mb-2 text-xs font-extrabold uppercase text-foreground/50">
            Evidências observadas
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {evidencias.map((ev) => (
              <label key={ev} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="evidencias" value={ev} />
                {ev}
              </label>
            ))}
          </div>
        </div>

        <textarea
          name="observacoes"
          rows={2}
          placeholder="Observações adicionais"
          className="w-full rounded-xl border border-foreground/10 bg-white/70 p-3 text-sm outline-none dark:bg-white/5"
        />

        <Button type="submit" className="self-end">
          💾 Salvar avaliação
        </Button>
      </form>
    </GlassCard>
  );
}
