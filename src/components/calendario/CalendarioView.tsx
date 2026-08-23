"use client";

import { useMemo, useState } from "react";
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

const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// Datas do calendário são só "dia do mês" (sem hora) — trabalhar em UTC evita
// que o fuso local jogue o dia certo para o vizinho errado na grade.
function chaveDia(data: Date) {
  const d = new Date(data);
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
}

export function CalendarioView({ eventos, podeEditar }: { eventos: Evento[]; podeEditar: boolean }) {
  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getUTCFullYear());
  const [mes, setMes] = useState(hoje.getUTCMonth());
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);

  const eventosPorDia = useMemo(() => {
    const mapa = new Map<string, Evento[]>();
    for (const ev of eventos) {
      const chave = chaveDia(ev.data);
      (mapa.get(chave) ?? mapa.set(chave, []).get(chave)!).push(ev);
    }
    return mapa;
  }, [eventos]);

  const primeiroDiaSemana = new Date(Date.UTC(ano, mes, 1)).getUTCDay();
  const diasNoMes = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
  const celulas: (number | null)[] = [
    ...Array(primeiroDiaSemana).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];
  while (celulas.length % 7 !== 0) celulas.push(null);

  function mudarMes(delta: number) {
    setDiaSelecionado(null);
    let novoMes = mes + delta;
    let novoAno = ano;
    if (novoMes < 0) { novoMes = 11; novoAno -= 1; }
    if (novoMes > 11) { novoMes = 0; novoAno += 1; }
    setMes(novoMes);
    setAno(novoAno);
  }

  const ehHoje = (dia: number) =>
    dia === hoje.getUTCDate() && mes === hoje.getUTCMonth() && ano === hoje.getUTCFullYear();

  const eventosDoDiaSelecionado =
    diaSelecionado !== null ? eventosPorDia.get(`${ano}-${mes}-${diaSelecionado}`) ?? [] : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black">🗓️ Calendário Institucional</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Todas as atividades do instituto, visíveis para a gestão e os núcleos.
          {podeEditar && " Clique num dia para adicionar uma atividade."}
        </p>
      </div>

      <GlassCard className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => mudarMes(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-lg font-black hover:bg-black/10 dark:bg-white/10"
          >
            ‹
          </button>
          <p className="text-lg font-black uppercase">
            {MESES[mes]} {ano}
          </p>
          <button
            onClick={() => mudarMes(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-lg font-black hover:bg-black/10 dark:bg-white/10"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold uppercase text-foreground/50 sm:text-xs">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="py-1">
              {d.slice(0, 3)}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {celulas.map((dia, i) => {
            if (dia === null) return <div key={i} />;
            const evs = eventosPorDia.get(`${ano}-${mes}-${dia}`) ?? [];
            const selecionado = diaSelecionado === dia;
            return (
              <button
                key={i}
                onClick={() => setDiaSelecionado(selecionado ? null : dia)}
                className={`flex min-h-16 flex-col items-start gap-1 rounded-xl border p-1.5 text-left transition sm:min-h-20 sm:p-2 ${
                  selecionado
                    ? "border-imla-accent bg-imla-accent/10"
                    : ehHoje(dia)
                      ? "border-imla-accent/40 bg-imla-accent/5"
                      : "border-transparent hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                <span className={`text-xs font-bold ${ehHoje(dia) ? "text-imla-accent-dark" : ""}`}>{dia}</span>
                <div className="flex w-full flex-col gap-0.5">
                  {evs.slice(0, 2).map((ev) => (
                    <span
                      key={ev.id}
                      className="truncate rounded bg-imla-accent/20 px-1 text-[9px] font-bold text-imla-accent-dark sm:text-[10px]"
                    >
                      {ev.titulo}
                    </span>
                  ))}
                  {evs.length > 2 && (
                    <span className="text-[9px] font-bold text-foreground/40">+{evs.length - 2}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {diaSelecionado !== null && (
        <GlassCard className="p-5">
          <p className="mb-3 font-extrabold">
            {diaSelecionado} de {MESES[mes]} de {ano}
          </p>

          {eventosDoDiaSelecionado.length === 0 && (
            <p className="mb-3 text-sm text-foreground/50">Nenhuma atividade neste dia ainda.</p>
          )}

          <div className="mb-4 flex flex-col gap-2">
            {eventosDoDiaSelecionado.map((ev) => (
              <div key={ev.id} className="flex items-start justify-between gap-3 rounded-xl bg-black/5 p-3 dark:bg-white/5">
                <div>
                  <p className="text-sm font-extrabold">{ev.titulo}</p>
                  {ev.descricao && <p className="mt-0.5 text-xs text-foreground/60">{ev.descricao}</p>}
                  <p className="mt-1 text-[10px] font-semibold text-foreground/40">
                    adicionado por {ev.autor.nome}
                  </p>
                </div>
                {podeEditar && (
                  <form action={excluirEvento}>
                    <input type="hidden" name="id" value={ev.id} />
                    <button type="submit" className="shrink-0 text-xs font-bold text-red-500">
                      🗑️
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>

          {podeEditar && (
            <form
              action={criarEvento}
              className="flex flex-col gap-3 border-t border-foreground/10 pt-4"
            >
              <input
                type="hidden"
                name="data"
                value={`${ano}-${String(mes + 1).padStart(2, "0")}-${String(diaSelecionado).padStart(2, "0")}`}
              />
              <input
                name="titulo"
                required
                placeholder="Título da atividade"
                className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
              />
              <textarea
                name="descricao"
                rows={2}
                placeholder="Descrição (opcional)"
                className="w-full rounded-xl border border-foreground/10 bg-white/70 p-3 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
              />
              <Button type="submit" className="self-end">
                ➕ Adicionar
              </Button>
            </form>
          )}
        </GlassCard>
      )}
    </div>
  );
}
