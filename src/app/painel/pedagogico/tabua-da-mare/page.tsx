import { prisma } from "@/lib/db";
import { GlassCard } from "@/components/ui/GlassCard";
import { TabuaMareView } from "@/components/pedagogico/TabuaMareView";

export default async function TabuaMarePage() {
  try {
    const alunos = await prisma.aluno.findMany({
      include: { avaliacoesMare: { orderBy: { criadoEm: "asc" } } },
      orderBy: { nome: "asc" },
    });

    return <TabuaMareView alunos={alunos} />;
  } catch {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-lg font-extrabold">🔌 Banco de dados ainda não conectado</p>
        <p className="mt-2 text-sm text-foreground/60">
          Assim que a connection string do Postgres for configurada, esta tela vai
          mostrar as avaliações da Tábua da Maré de cada criança.
        </p>
      </GlassCard>
    );
  }
}
