import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GlassCard } from "@/components/ui/GlassCard";
import { ApadrinhamentoView } from "@/components/apadrinhamento/ApadrinhamentoView";

export default async function ApadrinhamentoPage({
  searchParams,
}: PageProps<"/painel/apadrinhamento">) {
  const sessao = await obterSessao();
  if (!sessao) redirect("/");

  if (sessao.papel === "NUCLEO" || sessao.papel === "VISITANTE") {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-lg font-extrabold">🔒 Área restrita</p>
        <p className="mt-2 text-sm text-foreground/60">
          O Canal do Apadrinhamento é exclusivo para padrinhos, madrinhas e a
          coordenação.
        </p>
      </GlassCard>
    );
  }

  try {
    if (sessao.papel === "PADRINHO") {
      const alunos = await prisma.aluno.findMany({
        where: { padrinho: { equals: sessao.nome, mode: "insensitive" } },
        include: {
          avaliacoesMare: { orderBy: { criadoEm: "asc" } },
          avaliacoesAlfabetizacao: { orderBy: [{ ano: "asc" }, { etapa: "asc" }] },
          matriculaTurnoEstendido: true,
        },
      });

      return <ApadrinhamentoView alunos={alunos} nomePadrinho={sessao.nome} ehAdmin={false} />;
    }

    // ADMIN: pode visualizar qualquer padrinho/madrinha cadastrado
    const params = await searchParams;
    const padrinhoParam = Array.isArray(params.padrinho) ? params.padrinho[0] : params.padrinho;

    const todosPadrinhos = await prisma.aluno.findMany({
      where: { padrinho: { not: null } },
      select: { padrinho: true },
      distinct: ["padrinho"],
    });
    const listaPadrinhos = todosPadrinhos
      .map((p) => p.padrinho)
      .filter((p): p is string => Boolean(p))
      .sort();

    const alunos = padrinhoParam
      ? await prisma.aluno.findMany({
          where: { padrinho: { equals: padrinhoParam, mode: "insensitive" } },
          include: {
            avaliacoesMare: { orderBy: { criadoEm: "asc" } },
            avaliacoesAlfabetizacao: { orderBy: [{ ano: "asc" }, { etapa: "asc" }] },
            matriculaTurnoEstendido: true,
          },
        })
      : [];

    return (
      <ApadrinhamentoView
        alunos={alunos}
        nomePadrinho={padrinhoParam ?? ""}
        ehAdmin
        listaPadrinhos={listaPadrinhos}
      />
    );
  } catch {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-lg font-extrabold">🔌 Banco de dados ainda não conectado</p>
        <p className="mt-2 text-sm text-foreground/60">
          Assim que a connection string do Postgres for configurada, esta tela vai
          mostrar o acompanhamento do afilhado ou afilhada.
        </p>
      </GlassCard>
    );
  }
}
