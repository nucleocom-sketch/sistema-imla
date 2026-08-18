"use client";

import { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  NUCLEOS,
  PRIORIDADES,
  STATUS_TAREFA,
  type NucleoKey,
} from "@/lib/config";
import {
  criarPostagem,
  criarTarefa,
  atualizarTarefa,
  excluirTarefa,
  criarLembrete,
  excluirLembrete,
  enviarSolicitacao,
} from "@/app/painel/intranet/actions";

type Autor = { nome: string };

type Postagem = { id: string; texto: string; criadoEm: Date; autor: Autor };
type Tarefa = {
  id: string;
  titulo: string;
  descricao: string | null;
  status: keyof typeof STATUS_TAREFA;
  prioridade: keyof typeof PRIORIDADES;
  criadoEm: Date;
  autor: Autor;
};
type Lembrete = {
  id: string;
  titulo: string;
  descricao: string | null;
  proximaData: Date;
  autor: Autor;
};
type Solicitacao = {
  id: string;
  assunto: string;
  mensagem: string | null;
  publica: boolean;
  criadoEm: Date;
  de: { nome: string; nucleo: NucleoKey | null };
};

type Props = {
  nucleoAtual: NucleoKey;
  podeEditar: boolean;
  podeVerCaixaCompleta: boolean;
  postagens: Postagem[];
  tarefas: Tarefa[];
  lembretes: Lembrete[];
  caixaEntrada: Solicitacao[];
};

const ABAS = [
  { key: "novidades", label: "Novidades" },
  { key: "tarefas", label: "Demandas" },
  { key: "lembretes", label: "Avisos" },
  { key: "solicitacoes", label: "Solicitações" },
] as const;

type AbaKey = (typeof ABAS)[number]["key"];

function formatarData(data: Date) {
  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function IntranetView({
  nucleoAtual,
  podeEditar,
  postagens,
  tarefas,
  lembretes,
  caixaEntrada,
}: Props) {
  const [aba, setAba] = useState<AbaKey>("novidades");
  const cfg = NUCLEOS[nucleoAtual];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {Object.entries(NUCLEOS).map(([key, n]) => (
          <Link key={key} href={`/painel/intranet?nucleo=${key}`}>
            <GlassCard
              hover
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold ${
                key === nucleoAtual ? "ring-2 ring-imla-accent" : ""
              }`}
            >
              <span>{n.icon}</span>
              <span>{n.label}</span>
            </GlassCard>
          </Link>
        ))}
      </div>

      <div>
        <h1 className="text-2xl font-black">
          {cfg.icon} {cfg.label}
        </h1>
        {!podeEditar && (
          <p className="mt-1 text-xs font-bold text-foreground/50">
            👁️ Modo leitura — você está vendo este núcleo apenas para visualização.
          </p>
        )}
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-full bg-black/5 p-1 dark:bg-white/5">
        {ABAS.map((a) => (
          <button
            key={a.key}
            onClick={() => setAba(a.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
              aba === a.key ? "bg-imla-accent text-white shadow" : "text-foreground/60"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {aba === "novidades" && (
        <AbaNovidades nucleoAtual={nucleoAtual} podeEditar={podeEditar} postagens={postagens} />
      )}
      {aba === "tarefas" && (
        <AbaTarefas nucleoAtual={nucleoAtual} podeEditar={podeEditar} tarefas={tarefas} />
      )}
      {aba === "lembretes" && (
        <AbaLembretes nucleoAtual={nucleoAtual} podeEditar={podeEditar} lembretes={lembretes} />
      )}
      {aba === "solicitacoes" && (
        <AbaSolicitacoes
          nucleoAtual={nucleoAtual}
          podeEditar={podeEditar}
          caixaEntrada={caixaEntrada}
        />
      )}
    </div>
  );
}

function AbaNovidades({
  nucleoAtual,
  podeEditar,
  postagens,
}: {
  nucleoAtual: NucleoKey;
  podeEditar: boolean;
  postagens: Postagem[];
}) {
  return (
    <div className="flex flex-col gap-4">
      {podeEditar && (
        <GlassCard className="p-5">
          <form action={criarPostagem} className="flex flex-col gap-3">
            <input type="hidden" name="nucleo" value={nucleoAtual} />
            <textarea
              name="texto"
              required
              rows={3}
              placeholder="Compartilhar algo novo com o núcleo..."
              className="w-full rounded-xl border border-foreground/10 bg-white/70 p-3 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
            />
            <Button type="submit" className="self-end">
              Publicar
            </Button>
          </form>
        </GlassCard>
      )}

      {postagens.length === 0 && (
        <p className="text-sm text-foreground/50">Nenhuma atualização ainda.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {postagens.map((p) => (
          <GlassCard key={p.id} className="p-5">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-imla-accent-dark">
              Novo
            </p>
            <p className="mt-1 text-sm font-extrabold">{p.autor.nome}</p>
            <p className="mt-2 text-sm text-foreground/70">{p.texto}</p>
            <p className="mt-3 text-[11px] font-semibold text-foreground/40">
              {formatarData(p.criadoEm)}
            </p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

const STATUS_KEYS = Object.keys(STATUS_TAREFA) as (keyof typeof STATUS_TAREFA)[];

function AbaTarefas({
  nucleoAtual,
  podeEditar,
  tarefas,
}: {
  nucleoAtual: NucleoKey;
  podeEditar: boolean;
  tarefas: Tarefa[];
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {podeEditar && (
        <div>
          <Button variant="secondary" onClick={() => setAberto((v) => !v)}>
            ➕ Nova demanda
          </Button>
          {aberto && (
            <GlassCard className="mt-3 p-5">
              <form action={criarTarefa} className="flex flex-col gap-3">
                <input type="hidden" name="nucleo" value={nucleoAtual} />
                <input
                  name="titulo"
                  required
                  placeholder="Título da demanda"
                  className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
                />
                <textarea
                  name="descricao"
                  rows={2}
                  placeholder="Descrição (o que precisa ser feito)"
                  className="w-full rounded-xl border border-foreground/10 bg-white/70 p-3 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
                />
                <select
                  name="prioridade"
                  defaultValue="MEDIA"
                  className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
                >
                  {Object.entries(PRIORIDADES).map(([key, p]) => (
                    <option key={key} value={key}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <Button type="submit" className="self-end">
                  Adicionar demanda
                </Button>
              </form>
            </GlassCard>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {STATUS_KEYS.map((statusKey) => (
          <div key={statusKey}>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-foreground/50">
              {STATUS_TAREFA[statusKey].label}
            </p>
            <div className="flex flex-col gap-3">
              {tarefas
                .filter((t) => t.status === statusKey)
                .map((t) => (
                  <CartaoTarefa key={t.id} tarefa={t} nucleoAtual={nucleoAtual} podeEditar={podeEditar} />
                ))}
              {tarefas.filter((t) => t.status === statusKey).length === 0 && (
                <p className="text-xs text-foreground/40">—</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CartaoTarefa({
  tarefa,
  nucleoAtual,
  podeEditar,
}: {
  tarefa: Tarefa;
  nucleoAtual: NucleoKey;
  podeEditar: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const cor = PRIORIDADES[tarefa.prioridade].cor;

  return (
    <GlassCard className="border-l-4 p-4" style={{ borderLeftColor: cor }}>
      <p className="text-sm font-extrabold">{tarefa.titulo}</p>
      {tarefa.descricao && (
        <p className="mt-1 text-xs text-foreground/60">{tarefa.descricao}</p>
      )}
      <Badge label={PRIORIDADES[tarefa.prioridade].label} color={cor} className="mt-2" />
      <p className="mt-2 text-[10px] font-semibold text-foreground/40">
        Criado por {tarefa.autor.nome}
      </p>

      {podeEditar && (
        <>
          <button
            onClick={() => setEditando((v) => !v)}
            className="mt-2 text-xs font-bold text-imla-accent-dark"
          >
            ✏️ Editar
          </button>
          {editando && (
            <form action={atualizarTarefa} className="mt-3 flex flex-col gap-2 border-t border-foreground/10 pt-3">
              <input type="hidden" name="id" value={tarefa.id} />
              <input type="hidden" name="nucleo" value={nucleoAtual} />
              <input
                name="titulo"
                defaultValue={tarefa.titulo}
                className="w-full rounded-lg border border-foreground/10 bg-white/70 px-3 py-1.5 text-xs outline-none dark:bg-white/5"
              />
              <textarea
                name="descricao"
                defaultValue={tarefa.descricao ?? ""}
                rows={2}
                className="w-full rounded-lg border border-foreground/10 bg-white/70 p-2 text-xs outline-none dark:bg-white/5"
              />
              <select
                name="status"
                defaultValue={tarefa.status}
                className="w-full rounded-lg border border-foreground/10 bg-white/70 px-3 py-1.5 text-xs outline-none dark:bg-white/5"
              >
                {STATUS_KEYS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_TAREFA[s].label}
                  </option>
                ))}
              </select>
              <select
                name="prioridade"
                defaultValue={tarefa.prioridade}
                className="w-full rounded-lg border border-foreground/10 bg-white/70 px-3 py-1.5 text-xs outline-none dark:bg-white/5"
              >
                {Object.entries(PRIORIDADES).map(([key, p]) => (
                  <option key={key} value={key}>
                    {p.label}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 !py-1.5 !text-xs">
                  Salvar
                </Button>
                <Button
                  formAction={excluirTarefa}
                  variant="danger"
                  className="flex-1 !py-1.5 !text-xs"
                >
                  Excluir
                </Button>
              </div>
            </form>
          )}
        </>
      )}
    </GlassCard>
  );
}

function AbaLembretes({
  nucleoAtual,
  podeEditar,
  lembretes,
}: {
  nucleoAtual: NucleoKey;
  podeEditar: boolean;
  lembretes: Lembrete[];
}) {
  const [aberto, setAberto] = useState(false);
  const hoje = new Date();

  return (
    <div className="flex flex-col gap-4">
      {podeEditar && (
        <div>
          <Button variant="secondary" onClick={() => setAberto((v) => !v)}>
            ➕ Novo lembrete
          </Button>
          {aberto && (
            <GlassCard className="mt-3 p-5">
              <form action={criarLembrete} className="flex flex-col gap-3">
                <input type="hidden" name="nucleo" value={nucleoAtual} />
                <input
                  name="titulo"
                  required
                  placeholder="Nome da tarefa"
                  className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
                />
                <textarea
                  name="descricao"
                  rows={2}
                  placeholder="O que precisa ser feito"
                  className="w-full rounded-xl border border-foreground/10 bg-white/70 p-3 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
                />
                <input
                  type="date"
                  name="proximaData"
                  required
                  className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
                />
                <Button type="submit" className="self-end">
                  💾 Salvar
                </Button>
              </form>
            </GlassCard>
          )}
        </div>
      )}

      {lembretes.length === 0 && <p className="text-sm text-foreground/50">Nenhum lembrete cadastrado.</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lembretes.map((l) => {
          const atrasado = new Date(l.proximaData) < hoje;
          return (
            <GlassCard key={l.id} className="border-l-4 border-imla-accent p-4">
              <p className="text-sm font-extrabold">{l.titulo}</p>
              {l.descricao && <p className="mt-1 text-xs text-foreground/60">{l.descricao}</p>}
              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-[11px] font-bold ${
                  atrasado ? "bg-red-500/10 text-red-500" : "bg-imla-accent/10 text-imla-accent-dark"
                }`}
              >
                {atrasado ? "⚠️" : "📅"} {formatarData(l.proximaData)}
              </span>
              <p className="mt-2 text-[10px] font-semibold text-foreground/40">
                Criado por {l.autor.nome}
              </p>
              {podeEditar && (
                <form action={excluirLembrete} className="mt-2">
                  <input type="hidden" name="id" value={l.id} />
                  <input type="hidden" name="nucleo" value={nucleoAtual} />
                  <button type="submit" className="text-xs font-bold text-red-500">
                    🗑️ Excluir
                  </button>
                </form>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

function AbaSolicitacoes({
  nucleoAtual,
  podeEditar,
  caixaEntrada,
}: {
  nucleoAtual: NucleoKey;
  podeEditar: boolean;
  caixaEntrada: Solicitacao[];
}) {
  return (
    <div className="flex flex-col gap-6">
      {podeEditar && (
        <GlassCard className="p-5">
          <p className="mb-3 font-extrabold">Enviar solicitação</p>
          <form action={enviarSolicitacao} className="flex flex-col gap-3">
            <input type="hidden" name="nucleoOrigem" value={nucleoAtual} />
            <select
              name="nucleoDestino"
              required
              className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none dark:bg-white/5"
            >
              {Object.entries(NUCLEOS).map(([key, n]) => (
                <option key={key} value={key}>
                  {n.icon} {n.label}
                </option>
              ))}
            </select>
            <input
              name="assunto"
              required
              placeholder="Assunto"
              className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none dark:bg-white/5"
            />
            <textarea
              name="mensagem"
              rows={3}
              placeholder="Mensagem"
              className="w-full rounded-xl border border-foreground/10 bg-white/70 p-3 text-sm outline-none dark:bg-white/5"
            />
            <div className="flex items-center gap-4 text-sm font-semibold">
              <label className="flex items-center gap-2">
                <input type="radio" name="publica" value="false" defaultChecked /> Privada
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="publica" value="true" /> Pública
              </label>
            </div>
            <Button type="submit" className="self-end">
              Enviar
            </Button>
          </form>
        </GlassCard>
      )}

      <div>
        <p className="mb-3 font-extrabold">Caixa de Entrada</p>
        {!podeEditar && (
          <p className="mb-3 text-xs font-semibold text-foreground/50">
            👁️ Você está vendo apenas as solicitações públicas deste núcleo.
          </p>
        )}
        {caixaEntrada.length === 0 && (
          <p className="text-sm text-foreground/50">Nenhuma solicitação por aqui ainda.</p>
        )}
        <div className="flex flex-col gap-3">
          {caixaEntrada.map((s) => (
            <GlassCard key={s.id} className="p-4">
              <p className="text-sm font-extrabold">
                {s.publica ? "🌐" : "🔒"} 📩 {s.assunto}
              </p>
              <p className="mt-1 text-xs font-semibold text-foreground/50">
                De: {s.de.nome} {s.de.nucleo ? `· ${NUCLEOS[s.de.nucleo].label}` : ""}
              </p>
              {s.mensagem && <p className="mt-2 text-sm text-foreground/70">{s.mensagem}</p>}
              <p className="mt-2 text-[11px] font-semibold text-foreground/40">
                {formatarData(s.criadoEm)}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
