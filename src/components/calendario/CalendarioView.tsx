"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { criarEvento, excluirEvento } from "@/app/painel/calendario/actions";

type Evento = {
  id: string;
  titulo: string;
  descricao: string | null;
  data: Date;
  autor: { nome: string };
};

function formatarDataCalendario(data: Date) {
  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function mesAno(data: Date) {
  return new Date(data).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function CalendarioView({ eventos, podeEditar }: { eventos: Evento[]; podeEditar: boolean }) {
  const [aberto, setAberto] = useState(false);

  const grupos = eventos.reduce<Record<string, Evento[]>>((acc, ev) => {
    const chave = mesAno(ev.data);
    (acc[chave] ??= []).push(ev);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black">🗓️ Calendário Institucional</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Todas as atividades do instituto, visíveis para a gestão e os núcleos.
        </p>
      </div>

      {podeEditar && (
        <div>
          <Button variant="secondary" onClick={() => setAberto((v) => !v)}>
            ➕ Nova atividade
          </Button>
          {aberto && (
            <GlassCard className="mt-3 p-5">
              <form action={criarEvento} className="flex flex-col gap-3">
                <input
                  name="titulo"
                  required
                  placeholder="Título da atividade"
                  className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
                />
                <input
                  type="date"
                  name="data"
                  required
                  className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
                />
                <textarea
                  name="descricao"
                  rows={2}
                  placeholder="Descrição (opcional)"
                  className="w-full rounded-xl border border-foreground/10 bg-white/70 p-3 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
                />
                <Button type="submit" className="self-end">
                  Adicionar ao calendário
                </Button>
              </form>
            </GlassCard>
          )}
        </div>
      )}

      {eventos.length === 0 && (
        <p className="text-sm text-foreground/50">Nenhuma atividade cadastrada ainda.</p>
      )}

      <div className="flex flex-col gap-6">
        {Object.entries(grupos).map(([mes, evs]) => (
          <div key={mes}>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-foreground/50">
              {mes}
            </p>
            <div className="flex flex-col gap-3">
              {evs.map((ev) => (
                <GlassCard key={ev.id} className="flex items-start gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-imla-accent/10 text-imla-accent-dark">
                    <span className="text-lg font-black">
                      {new Date(ev.data).toLocaleDateString("pt-BR", { day: "2-digit", timeZone: "UTC" })}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-extrabold">{ev.titulo}</p>
                    {ev.descricao && (
                      <p className="mt-1 text-xs text-foreground/60">{ev.descricao}</p>
                    )}
                    <p className="mt-2 text-[11px] font-semibold text-foreground/40">
                      {formatarDataCalendario(ev.data)} · adicionado por {ev.autor.nome}
                    </p>
                  </div>
                  {podeEditar && (
                    <form action={excluirEvento}>
                      <input type="hidden" name="id" value={ev.id} />
                      <button type="submit" className="text-xs font-bold text-red-500">
                        🗑️
                      </button>
                    </form>
                  )}
                </GlassCard>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
