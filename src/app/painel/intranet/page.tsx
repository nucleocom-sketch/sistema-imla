import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NUCLEOS, type NucleoKey } from "@/lib/config";
import { IntranetView } from "@/components/intranet/IntranetView";
import { GlassCard } from "@/components/ui/GlassCard";

export default async function IntranetPage({
  searchParams,
}: PageProps<"/painel/intranet">) {
  const sessao = await obterSessao();
  if (!sessao) redirect("/");

  const params = await searchParams;
  const nucleoParam = Array.isArray(params.nucleo) ? params.nucleo[0] : params.nucleo;

  const nucleoAtual: NucleoKey =
    (nucleoParam as NucleoKey) ??
    sessao.nucleo ??
    (Object.keys(NUCLEOS)[0] as NucleoKey);

  const podeEditar = sessao.papel === "ADMIN" || (sessao.papel === "NUCLEO" && sessao.nucleo === nucleoAtual);

  try {
    const [postagens, tarefas, lembretes, caixaEntrada, links] = await Promise.all([
      prisma.postagem.findMany({
        where: podeEditar ? { nucleo: nucleoAtual } : { nucleo: nucleoAtual, publica: true },
        include: { autor: { select: { nome: true } } },
        orderBy: { criadoEm: "desc" },
        take: 30,
      }),
      prisma.tarefa.findMany({
        where: podeEditar ? { nucleo: nucleoAtual } : { nucleo: nucleoAtual, publica: true },
        include: { autor: { select: { nome: true } } },
        orderBy: { criadoEm: "desc" },
      }),
      prisma.lembrete.findMany({
        where: podeEditar ? { nucleo: nucleoAtual } : { nucleo: nucleoAtual, publica: true },
        include: { autor: { select: { nome: true } } },
        orderBy: { proximaData: "asc" },
      }),
      prisma.solicitacao.findMany({
        where: podeEditar ? { nucleoDestino: nucleoAtual } : { nucleoDestino: nucleoAtual, publica: true },
        include: { de: { select: { nome: true, nucleo: true } } },
        orderBy: { criadoEm: "desc" },
      }),
      prisma.linkNucleo.findMany({
        where: podeEditar ? { nucleo: nucleoAtual } : { nucleo: nucleoAtual, publico: true },
        include: { autor: { select: { nome: true } } },
        orderBy: { criadoEm: "desc" },
      }),
    ]);

    return (
      <IntranetView
        nucleoAtual={nucleoAtual}
        podeEditar={podeEditar}
        podeVerCaixaCompleta={podeEditar}
        postagens={postagens}
        tarefas={tarefas}
        lembretes={lembretes}
        caixaEntrada={caixaEntrada}
        links={links}
      />
    );
  } catch {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-lg font-extrabold">🔌 Banco de dados ainda não conectado</p>
        <p className="mt-2 text-sm text-foreground/60">
          Assim que a connection string do Postgres for configurada, esta tela vai
          mostrar o feed, as tarefas, os lembretes e as solicitações do núcleo em
          tempo real.
        </p>
      </GlassCard>
    );
  }
}
