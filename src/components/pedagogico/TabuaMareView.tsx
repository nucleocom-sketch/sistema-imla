"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { WaveIndicator } from "@/components/ui/WaveIndicator";
import { Select } from "@/components/ui/Select";
import { SALAS, CATEGORIAS_MARE, NIVEIS_MARE, type SalaKey } from "@/lib/config";
import { salvarAvaliacaoMare } from "@/app/painel/pedagogico/actions";

type AvaliacaoMare = {
  id: string;
  semestre: string;
  notas: unknown;
  observacoes: string | null;
};

type Aluno = {
  id: string;
  nome: string;
  sala: SalaKey;
  avaliacoesMare: AvaliacaoMare[];
};

const NIVEL_INDEX: Record<string, number> = Object.fromEntries(
  NIVEIS_MARE.map((n, i) => [n.key, i + 1])
);

export function TabuaMareView({ alunos }: { alunos: Aluno[] }) {
  const [salaAtual, setSalaAtual] = useState<SalaKey>("ROSA");
  const [alunoAberto, setAlunoAberto] = useState<string | null>(null);

  const alunosDaSala = alunos.filter((a) => a.sala === salaAtual);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {Object.entries(SALAS).map(([key, s]) => (
          <button
            key={key}
            onClick={() => {
              setSalaAtual(key as SalaKey);
              setAlunoAberto(null);
            }}
          >
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

      <div className="flex flex-col gap-3">
        {alunosDaSala.map((aluno) => (
          <GlassCard key={aluno.id} className="p-0">
            <button
              onClick={() => setAlunoAberto((v) => (v === aluno.id ? null : aluno.id))}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <span className="font-extrabold">👤 {aluno.nome}</span>
              <span className="text-xs font-bold text-foreground/40">
                {aluno.avaliacoesMare.length} avaliação(ões)
              </span>
            </button>

            {alunoAberto === aluno.id && (
              <div className="flex flex-col gap-4 border-t border-foreground/10 p-4">
                {aluno.avaliacoesMare.map((av) => (
                  <div key={av.id} className="rounded-2xl bg-black/[0.03] p-4 dark:bg-white/5">
                    <p className="mb-3 text-sm font-extrabold">🗓️ {av.semestre}</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                      {CATEGORIAS_MARE.map((cat, i) => {
                        const nivel = String((av.notas as string[])[i] ?? "BAIXA");
                        const idx = NIVEL_INDEX[nivel] ?? 1;
                        return (
                          <div key={cat} className="text-center">
                            <WaveIndicator percent={idx * 20} size="sm" className="mx-auto" />
                            <p className="mt-1 text-[10px] font-bold leading-tight text-foreground/60">
                              {cat}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    {av.observacoes && (
                      <p className="mt-3 rounded-lg bg-imla-accent/10 p-3 text-xs text-foreground/70">
                        <b>Observação:</b> {av.observacoes}
                      </p>
                    )}
                  </div>
                ))}

                <FormularioAvaliacao alunoId={aluno.id} />
              </div>
            )}
          </GlassCard>
        ))}

        {alunosDaSala.length === 0 && (
          <p className="text-sm text-foreground/50">
            Nenhum aluno cadastrado na {SALAS[salaAtual].label}.
          </p>
        )}
      </div>
    </div>
  );
}

function FormularioAvaliacao({ alunoId }: { alunoId: string }) {
  return (
    <form action={salvarAvaliacaoMare} className="flex flex-col gap-3 border-t border-foreground/10 pt-4">
      <input type="hidden" name="alunoId" value={alunoId} />
      <p className="text-sm font-extrabold">⭐ Nova avaliação</p>
      <Select
        name="semestre"
        defaultValue="1º Semestre"
        className="max-w-xs"
        options={[
          { value: "1º Semestre", label: "1º Semestre" },
          { value: "2º Semestre", label: "2º Semestre" },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CATEGORIAS_MARE.map((cat, i) => (
          <div key={cat} className="flex flex-col gap-1">
            <label className="text-xs font-bold text-foreground/70">{cat}</label>
            <Select
              name={`nota_${i}`}
              defaultValue="ENCHENTE"
              options={NIVEIS_MARE.map((n) => ({ value: n.key, label: n.label }))}
            />
          </div>
        ))}
      </div>

      <textarea
        name="observacoes"
        rows={2}
        placeholder="Observações pedagógicas"
        className="w-full rounded-xl border border-foreground/10 bg-white/70 p-3 text-sm outline-none dark:bg-white/5"
      />

      <Button type="submit" className="self-end">
        💾 Salvar na Tábua da Maré
      </Button>
    </form>
  );
}
