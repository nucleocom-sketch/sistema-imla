"use client";

import { useEffect, useState } from "react";
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
  criarTarefa,
  atualizarTarefa,
  excluirTarefa,
  criarLembrete,
  excluirLembrete,
  criarLink,
  excluirLink,
  enviarSolicitacao,
  enviarNotificacaoReuniao,
  criarCiranda,
  excluirCiranda,
} from "@/app/painel/intranet/actions";
import { PublicoToggle } from "@/components/intranet/PublicoToggle";
import { Select } from "@/components/ui/Select";
import { InstitucionalHero } from "@/components/intranet/InstitucionalHero";
import { TextoFormatado } from "@/components/ui/TextoFormatado";
import { AnexosField, ListaAnexos } from "@/components/ui/AnexosField";

type Autor = { nome: string };

type Tarefa = {
  id: string;
  titulo: string;
  descricao: string | null;
  status: keyof typeof STATUS_TAREFA;
  prioridade: keyof typeof PRIORIDADES;
  publica: boolean;
  prazo: Date | null;
  recorrencia: "NENHUMA" | "MENSAL";
  diaRecorrencia: number | null;
  anexos: string[];
  criadoEm: Date;
  autor: Autor;
};
type Ciranda = {
  id: string;
  semana: string;
  tema: string;
  desenvolvimento: string;
  anexos: string[];
  criadoEm: Date;
  autor: Autor;
};
type Lembrete = {
  id: string;
  titulo: string;
  descricao: string | null;
  proximaData: Date;
  publica: boolean;
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
type LinkItem = {
  id: string;
  titulo: string;
  url: string;
  publico: boolean;
  criadoEm: Date;
  autor: Autor;
};

type Props = {
  nucleoAtual: NucleoKey;
  podeEditar: boolean;
  podeVerCaixaCompleta: boolean;
  tarefas: Tarefa[];
  lembretes: Lembrete[];
  caixaEntrada: Solicitacao[];
  links: LinkItem[];
  cirandas: Ciranda[];
};

const ABAS_BASE = [
  { key: "tarefas", label: "Demandas" },
  { key: "lembretes", label: "Avisos" },
  { key: "links", label: "Links" },
  { key: "solicitacoes", label: "Solicitações" },
] as const;

const ABA_CIRANDA = { key: "ciranda", label: "Próxima Ciranda" } as const;

type AbaKey = (typeof ABAS_BASE)[number]["key"] | typeof ABA_CIRANDA.key;

function formatarData(data: Date) {
  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// proximaData vem do <input type="date"> como um calendário puro (sem hora).
// Formatar em UTC evita que o fuso local jogue a data um dia para trás.
function formatarDataCalendario(data: Date) {
  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function IntranetView({
  nucleoAtual,
  podeEditar,
  tarefas,
  lembretes,
  caixaEntrada,
  links,
  cirandas,
}: Props) {
  const abas = nucleoAtual === "PEDAGOGICO" ? [...ABAS_BASE, ABA_CIRANDA] : ABAS_BASE;
  const [aba, setAbaState] = useState<AbaKey>("tarefas");
  const [reuniaoAberta, setReuniaoAberta] = useState(false);
  const cfg = NUCLEOS[nucleoAtual];
  const abaStorageKey = `imla:aba:${nucleoAtual}`;

  // Lembra em qual aba (Demandas/Avisos/...) a pessoa estava neste núcleo,
  // para não perder o lugar ao sair para outra página e voltar.
  useEffect(() => {
    const salva = sessionStorage.getItem(abaStorageKey) as AbaKey | null;
    if (salva && abas.some((a) => a.key === salva)) setAbaState(salva);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nucleoAtual]);

  function setAba(a: AbaKey) {
    setAbaState(a);
    sessionStorage.setItem(abaStorageKey, a);
  }

  return (
    <div className="flex flex-col gap-6">
      <InstitucionalHero />

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
        {cfg.integrantes.length > 0 && (
          <p className="mt-1 text-xs font-semibold text-foreground/50">
            👥 {cfg.integrantes.join(" · ")}
          </p>
        )}
        {!podeEditar && (
          <p className="mt-1 text-xs font-bold text-foreground/50">
            👁️ Modo leitura — você está vendo este núcleo apenas para visualização.
          </p>
        )}
      </div>

      {podeEditar && (
        <div>
          <Button variant="secondary" onClick={() => setReuniaoAberta((v) => !v)}>
            📅 Notificar reunião
          </Button>
          {reuniaoAberta && (
            <FormularioReuniao nucleoAtual={nucleoAtual} onEnviado={() => setReuniaoAberta(false)} />
          )}
        </div>
      )}

      <div className="flex gap-1 overflow-x-auto rounded-full bg-black/5 p-1 dark:bg-white/5 [mask-image:linear-gradient(to_right,black_88%,transparent_100%)]">
        {abas.map((a) => (
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

      {aba === "tarefas" && (
        <AbaTarefas nucleoAtual={nucleoAtual} podeEditar={podeEditar} tarefas={tarefas} />
      )}
      {aba === "lembretes" && (
        <AbaLembretes nucleoAtual={nucleoAtual} podeEditar={podeEditar} lembretes={lembretes} />
      )}
      {aba === "links" && (
        <AbaLinks nucleoAtual={nucleoAtual} podeEditar={podeEditar} links={links} />
      )}
      {aba === "solicitacoes" && (
        <AbaSolicitacoes
          nucleoAtual={nucleoAtual}
          podeEditar={podeEditar}
          caixaEntrada={caixaEntrada}
        />
      )}
      {aba === "ciranda" && (
        <AbaCiranda podeEditar={podeEditar} cirandas={cirandas} />
      )}
    </div>
  );
}

function FormularioReuniao({
  nucleoAtual,
  onEnviado,
}: {
  nucleoAtual: NucleoKey;
  onEnviado: () => void;
}) {
  return (
    <GlassCard className="mt-3 p-5">
      <form
        action={async (formData) => {
          await enviarNotificacaoReuniao(formData);
          onEnviado();
        }}
        className="flex flex-col gap-3"
      >
        <input type="hidden" name="nucleoOrigem" value={nucleoAtual} />
        <input
          name="titulo"
          required
          placeholder="Título do aviso (ex: Reunião extraordinária amanhã 14h)"
          className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
        />
        <textarea
          name="detalhes"
          rows={2}
          placeholder="Detalhes (opcional)"
          className="w-full rounded-xl border border-foreground/10 bg-white/70 p-3 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
        />
        <Select
          name="alcance"
          defaultValue="NUCLEO"
          options={[
            { value: "NUCLEO", label: `Só o meu núcleo (${NUCLEOS[nucleoAtual].label})` },
            { value: "TODOS", label: "Todos os núcleos e a coordenação" },
          ]}
        />
        <Button type="submit" className="self-end">
          🔔 Enviar notificação
        </Button>
      </form>
    </GlassCard>
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
  const [desabilitado, setDesabilitado] = useState(false);
  const [tipoPrazo, setTipoPrazo] = useState("SEM_PRAZO");

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
                  placeholder="Descrição (o que precisa ser feito) — links colados aqui ficam clicáveis"
                  className="w-full rounded-xl border border-foreground/10 bg-white/70 p-3 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
                />
                <Select
                  name="prioridade"
                  defaultValue="MEDIA"
                  options={Object.entries(PRIORIDADES).map(([key, p]) => ({ value: key, label: p.label }))}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground/70">Prazo</label>
                  <Select
                    name="tipoPrazo"
                    value={tipoPrazo}
                    onChange={setTipoPrazo}
                    options={[
                      { value: "SEM_PRAZO", label: "Sem prazo" },
                      { value: "PRAZO_FINAL", label: "Tem uma data final" },
                      { value: "MENSAL", label: "Se repete todo mês" },
                    ]}
                  />
                </div>
                {tipoPrazo === "PRAZO_FINAL" && (
                  <input
                    type="date"
                    name="prazo"
                    required
                    className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
                  />
                )}
                {tipoPrazo === "MENSAL" && (
                  <input
                    type="number"
                    name="diaRecorrencia"
                    required
                    min={1}
                    max={31}
                    placeholder="Todo dia (ex: 5)"
                    className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
                  />
                )}

                <AnexosField />

                <PublicoToggle
                  aviso="Demandas públicas ficam visíveis para qualquer pessoa no Portal Institucional, incluindo visitantes."
                  onDisabledChange={setDesabilitado}
                />
                <Button type="submit" className="self-end" disabled={desabilitado}>
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

  const hoje = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
  const vencida =
    tarefa.status !== "CONCLUIDA" &&
    ((tarefa.prazo && new Date(tarefa.prazo) < hoje) ||
      (tarefa.recorrencia === "MENSAL" && tarefa.diaRecorrencia !== null && tarefa.diaRecorrencia < hoje.getUTCDate()));

  return (
    <GlassCard className="border-l-4 p-4" style={{ borderLeftColor: cor }}>
      <p className="text-sm font-extrabold">{tarefa.titulo}</p>
      {tarefa.descricao && (
        <TextoFormatado texto={tarefa.descricao} className="mt-1 text-xs text-foreground/60" />
      )}
      <ListaAnexos anexos={tarefa.anexos} />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge label={PRIORIDADES[tarefa.prioridade].label} color={cor} />
        <span className="rounded-full bg-black/5 px-3 py-1 text-[10px] font-extrabold uppercase text-foreground/60 dark:bg-white/10">
          {tarefa.publica ? "🌐 Público" : "🔒 Privado"}
        </span>
        {tarefa.prazo && (
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${
              vencida ? "bg-red-500/15 text-red-600" : "bg-black/5 text-foreground/60 dark:bg-white/10"
            }`}
          >
            {vencida ? "⚠️ Venceu em" : "📅 Prazo:"} {formatarDataCalendario(tarefa.prazo)}
          </span>
        )}
        {tarefa.recorrencia === "MENSAL" && (
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${
              vencida ? "bg-red-500/15 text-red-600" : "bg-black/5 text-foreground/60 dark:bg-white/10"
            }`}
          >
            🔁 Todo dia {tarefa.diaRecorrencia}
          </span>
        )}
      </div>
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
              <Select
                name="status"
                defaultValue={tarefa.status}
                options={STATUS_KEYS.map((s) => ({ value: s, label: STATUS_TAREFA[s].label }))}
              />
              <Select
                name="prioridade"
                defaultValue={tarefa.prioridade}
                options={Object.entries(PRIORIDADES).map(([key, p]) => ({ value: key, label: p.label }))}
              />
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
  const [desabilitado, setDesabilitado] = useState(false);
  const agora = new Date();
  // proximaData é salva como meia-noite UTC do dia escolhido no calendário —
  // comparar contra a mesma referência evita marcar o dia de hoje como atrasado.
  const hoje = new Date(Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate()));

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
                <PublicoToggle
                  aviso="Avisos públicos ficam visíveis para qualquer pessoa no Portal Institucional, incluindo visitantes."
                  onDisabledChange={setDesabilitado}
                />
                <Button type="submit" className="self-end" disabled={desabilitado}>
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
              <span className="mt-1 mr-1 inline-block rounded-full bg-black/5 px-3 py-1 text-[10px] font-extrabold uppercase text-foreground/60">
                {l.publica ? "🌐 Público" : "🔒 Privado"}
              </span>
              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-[11px] font-bold ${
                  atrasado ? "bg-red-500/10 text-red-500" : "bg-imla-accent/10 text-imla-accent-dark"
                }`}
              >
                {atrasado ? "⚠️" : "📅"} {formatarDataCalendario(l.proximaData)}
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

function AbaLinks({
  nucleoAtual,
  podeEditar,
  links,
}: {
  nucleoAtual: NucleoKey;
  podeEditar: boolean;
  links: LinkItem[];
}) {
  const [aberto, setAberto] = useState(false);
  const [ehPublico, setEhPublico] = useState(false);
  const [confirmou, setConfirmou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function acaoCriar(formData: FormData) {
    setErro(null);
    try {
      await criarLink(formData);
      setAberto(false);
      setEhPublico(false);
      setConfirmou(false);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar o link.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {podeEditar && (
        <div>
          <Button
            variant="secondary"
            onClick={() => {
              setAberto((v) => !v);
              setErro(null);
            }}
          >
            🔗 Novo link
          </Button>
          {aberto && (
            <GlassCard className="mt-3 p-5">
              <form
                action={acaoCriar}
                className="flex flex-col gap-3"
                onSubmit={(e) => {
                  if (ehPublico && !confirmou) {
                    e.preventDefault();
                    setErro("Confirme que deseja tornar este link público antes de salvar.");
                  }
                }}
              >
                <input type="hidden" name="nucleo" value={nucleoAtual} />
                <input
                  name="titulo"
                  required
                  maxLength={60}
                  placeholder="Nome do botão (ex: Planilha de custos)"
                  className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
                />
                <input
                  name="url"
                  type="url"
                  required
                  placeholder="https://..."
                  className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
                />

                <div className="flex items-center gap-4 text-sm font-semibold">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="publico"
                      value="false"
                      checked={!ehPublico}
                      onChange={() => {
                        setEhPublico(false);
                        setConfirmou(false);
                        setErro(null);
                      }}
                    />
                    🔒 Privado
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="publico"
                      value="true"
                      checked={ehPublico}
                      onChange={() => {
                        setEhPublico(true);
                        setConfirmou(false);
                      }}
                    />
                    🌐 Público
                  </label>
                </div>

                {ehPublico && (
                  <div className="rounded-xl border border-imla-yellow/50 bg-imla-yellow/10 p-3">
                    <p className="text-xs font-bold text-foreground/80">
                      ⚠️ Links públicos ficam visíveis para qualquer pessoa que acessar o
                      Portal Institucional, incluindo visitantes. Tenha certeza de que este link pode
                      ser visto por todos antes de confirmar.
                    </p>
                    <label className="mt-2 flex items-center gap-2 text-xs font-bold">
                      <input
                        type="checkbox"
                        checked={confirmou}
                        onChange={(e) => setConfirmou(e.target.checked)}
                      />
                      Confirmo que quero tornar este link público
                    </label>
                  </div>
                )}

                <input type="hidden" name="confirmouPublico" value={confirmou ? "true" : "false"} />

                {erro && (
                  <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-500">
                    {erro}
                  </p>
                )}

                <Button type="submit" className="self-end" disabled={ehPublico && !confirmou}>
                  Salvar link
                </Button>
              </form>
            </GlassCard>
          )}
        </div>
      )}

      {links.length === 0 && <p className="text-sm text-foreground/50">Nenhum link cadastrado.</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <GlassCard key={l.id} hover className="p-4">
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="block text-sm font-extrabold text-imla-accent-dark hover:underline"
            >
              🔗 {l.titulo}
            </a>
            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${
                l.publico ? "bg-imla-accent/10 text-imla-accent-dark" : "bg-black/5 text-foreground/60"
              }`}
            >
              {l.publico ? "🌐 Público" : "🔒 Privado"}
            </span>
            <p className="mt-2 text-[10px] font-semibold text-foreground/40">
              Adicionado por {l.autor.nome}
            </p>
            {podeEditar && (
              <form action={excluirLink} className="mt-2">
                <input type="hidden" name="id" value={l.id} />
                <input type="hidden" name="nucleo" value={nucleoAtual} />
                <button type="submit" className="text-xs font-bold text-red-500">
                  🗑️ Excluir
                </button>
              </form>
            )}
          </GlassCard>
        ))}
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
            <Select
              name="nucleoDestino"
              defaultValue={Object.keys(NUCLEOS)[0]}
              options={[
                ...Object.entries(NUCLEOS).map(([key, n]) => ({ value: key, label: `${n.icon} ${n.label}` })),
                { value: "TODOS", label: "📢 Todos os núcleos" },
              ]}
            />
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

function AbaCiranda({
  podeEditar,
  cirandas,
}: {
  podeEditar: boolean;
  cirandas: Ciranda[];
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {podeEditar && (
        <div>
          <Button variant="secondary" onClick={() => setAberto((v) => !v)}>
            ➕ Nova Ciranda
          </Button>
          {aberto && (
            <GlassCard className="mt-3 p-5">
              <form action={criarCiranda} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground/70">Ciranda da semana</label>
                  <input
                    name="semana"
                    required
                    placeholder="ex: 25 a 29 de agosto"
                    className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground/70">Tema</label>
                  <input
                    name="tema"
                    required
                    className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground/70">Desenvolvimento</label>
                  <textarea
                    name="desenvolvimento"
                    required
                    rows={4}
                    placeholder="Como vai ser desenvolvida — links colados aqui ficam clicáveis"
                    className="w-full rounded-xl border border-foreground/10 bg-white/70 p-3 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
                  />
                </div>
                <AnexosField />
                <Button type="submit" className="self-end">
                  Publicar Ciranda
                </Button>
              </form>
            </GlassCard>
          )}
        </div>
      )}

      {cirandas.length === 0 && (
        <p className="text-sm text-foreground/50">Nenhuma Ciranda cadastrada ainda.</p>
      )}

      <div className="flex flex-col gap-4">
        {cirandas.map((c) => (
          <GlassCard key={c.id} className="p-5">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-imla-accent-dark">
              🎪 Ciranda da semana: {c.semana}
            </p>
            <p className="mt-1 text-sm font-extrabold">Tema: {c.tema}</p>
            <TextoFormatado texto={c.desenvolvimento} className="mt-2 text-sm text-foreground/70" />
            <ListaAnexos anexos={c.anexos} />
            <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-foreground/40">
              <span>{c.autor.nome} · {formatarData(c.criadoEm)}</span>
              {podeEditar && (
                <form action={excluirCiranda}>
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className="font-bold text-red-500">
                    🗑️ Excluir
                  </button>
                </form>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
