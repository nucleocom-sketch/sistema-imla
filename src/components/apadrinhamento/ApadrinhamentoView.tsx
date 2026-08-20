"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { WaveIndicator } from "@/components/ui/WaveIndicator";
import { Select } from "@/components/ui/Select";
import {
  SALAS,
  CATEGORIAS_MARE,
  NIVEIS_MARE,
  NIVEIS_ALFABETIZACAO,
  type SalaKey,
  type NivelAlfabetizacaoKey,
} from "@/lib/config";

type AvaliacaoMare = { id: string; semestre: string; notas: unknown; observacoes: string | null };
type AvaliacaoAlfabetizacao = {
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
  idade: number | null;
  comunidade: string | null;
  sala: SalaKey;
  avaliacoesMare: AvaliacaoMare[];
  avaliacoesAlfabetizacao: AvaliacaoAlfabetizacao[];
  matriculaTurnoEstendido: { id: string } | null;
};

const NIVEL_INDEX: Record<string, number> = Object.fromEntries(
  NIVEIS_MARE.map((n, i) => [n.key, i + 1])
);

const ETAPA_LABEL: Record<AvaliacaoAlfabetizacao["etapa"], string> = {
  PRIMEIRA: "1ª Avaliação",
  SEGUNDA: "2ª Avaliação",
  FINAL: "Avaliação Final",
};

function nivelInfo(key: NivelAlfabetizacaoKey) {
  return NIVEIS_ALFABETIZACAO.find((n) => n.key === key)!;
}

export function ApadrinhamentoView({
  alunos,
  nomePadrinho,
  ehAdmin,
  listaPadrinhos = [],
}: {
  alunos: Aluno[];
  nomePadrinho: string;
  ehAdmin: boolean;
  listaPadrinhos?: string[];
}) {
  const router = useRouter();
  const [afilhadoId, setAfilhadoId] = useState(alunos[0]?.id ?? "");
  const afilhado = alunos.find((a) => a.id === afilhadoId) ?? alunos[0];

  // Lembra o último padrinho visualizado pela coordenação, para não precisar
  // reabrir o dropdown e procurar o nome de novo ao voltar para esta página.
  useEffect(() => {
    if (!ehAdmin) return;
    if (nomePadrinho) {
      sessionStorage.setItem("imla:ultimoPadrinho", nomePadrinho);
    } else {
      const ultimo = sessionStorage.getItem("imla:ultimoPadrinho");
      if (ultimo) router.replace(`/painel/apadrinhamento?padrinho=${encodeURIComponent(ultimo)}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ehAdmin, nomePadrinho]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-black">💌 Canal do Apadrinhamento</h1>

      {ehAdmin && (
        <GlassCard className="p-5">
          <label className="mb-2 block text-xs font-bold text-foreground/60">
            👤 Selecionar Padrinho/Madrinha (visualização da coordenação)
          </label>
          <Select
            searchable
            className="max-w-md"
            value={nomePadrinho}
            placeholder="Selecione..."
            options={listaPadrinhos.map((p) => ({ value: p, label: p }))}
            onChange={(v) => router.push(`/painel/apadrinhamento?padrinho=${encodeURIComponent(v)}`)}
          />
        </GlassCard>
      )}

      {nomePadrinho && alunos.length === 0 && (
        <p className="text-sm text-foreground/50">
          Nenhum afilhado encontrado para {nomePadrinho}.
        </p>
      )}

      {alunos.length > 0 && (
        <>
          {alunos.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {alunos.map((a) => (
                <button key={a.id} onClick={() => setAfilhadoId(a.id)}>
                  <GlassCard
                    hover
                    className={`px-4 py-2 text-sm font-bold ${a.id === afilhadoId ? "ring-2 ring-imla-accent" : ""}`}
                  >
                    👶 {a.nome}
                  </GlassCard>
                </button>
              ))}
            </div>
          )}

          {afilhado && (
            <>
              <GlassCard className="flex flex-wrap items-center gap-5 p-5">
                {afilhado.avaliacoesAlfabetizacao.length > 0 && (
                  <WaveIndicator
                    percent={
                      ((NIVEIS_ALFABETIZACAO.findIndex(
                        (n) => n.key === afilhado.avaliacoesAlfabetizacao.at(-1)!.nivel
                      ) +
                        1) /
                        7) *
                      100
                    }
                    size="lg"
                    sublabel="status maré"
                  />
                )}
                <div>
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <p className="text-lg font-extrabold">{afilhado.nome}</p>
                  <span
                    className="rounded-full px-3 py-1 text-[11px] font-extrabold uppercase text-white"
                    style={{ backgroundColor: SALAS[afilhado.sala].cor }}
                  >
                    {SALAS[afilhado.sala].label}
                  </span>
                  {afilhado.matriculaTurnoEstendido && (
                    <span className="rounded-full bg-imla-purple/10 px-3 py-1 text-[11px] font-extrabold text-imla-purple">
                      ✨ Turno Estendido
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/60">
                  <b>Idade:</b> {afilhado.idade ?? "---"} · <b>Comunidade:</b>{" "}
                  {afilhado.comunidade ?? "---"}
                </p>
                </div>
              </GlassCard>

              {afilhado.matriculaTurnoEstendido && (
                <GlassCard className="p-5">
                  <p className="mb-3 font-extrabold">✨ Participa do Turno Estendido</p>
                  <p className="text-sm text-foreground/70">
                    Essa é uma ação do nosso Projeto &quot;Vamos Dar a Meia Volta e
                    Alfabetizar&quot;.
                  </p>
                </GlassCard>
              )}

              <GlassCard className="p-5">
                <p className="mb-3 font-extrabold">🌊 Tábua da Maré</p>
                {afilhado.avaliacoesMare.length === 0 && (
                  <p className="text-sm text-foreground/50">Nenhuma avaliação registrada ainda.</p>
                )}
                <div className="flex flex-col gap-4">
                  {afilhado.avaliacoesMare.map((av) => (
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
                </div>
              </GlassCard>

              {afilhado.matriculaTurnoEstendido && (
                <GlassCard className="overflow-x-auto p-5">
                  <p className="mb-3 font-extrabold">🚀 Trilha de desenvolvimento (alfabetização)</p>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {afilhado.avaliacoesAlfabetizacao.map((av, i) => (
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
                        {i < afilhado.avaliacoesAlfabetizacao.length - 1 && (
                          <span className="text-xl text-foreground/30">→</span>
                        )}
                      </div>
                    ))}
                    {afilhado.avaliacoesAlfabetizacao.length === 0 && (
                      <p className="text-sm text-foreground/50">Sem avaliações registradas ainda.</p>
                    )}
                  </div>
                </GlassCard>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
