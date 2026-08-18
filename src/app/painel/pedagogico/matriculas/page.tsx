import { prisma } from "@/lib/db";
import { GlassCard } from "@/components/ui/GlassCard";
import { MatriculasView } from "@/components/pedagogico/MatriculasView";

export default async function MatriculasPage() {
  try {
    const alunos = await prisma.aluno.findMany({
      include: { matriculaTurnoEstendido: true },
      orderBy: { nome: "asc" },
    });

    return <MatriculasView alunos={alunos} />;
  } catch {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-lg font-extrabold">🔌 Banco de dados ainda não conectado</p>
        <p className="mt-2 text-sm text-foreground/60">
          Assim que a connection string do Postgres for configurada, esta tela vai
          listar as crianças matriculadas por sala, com apadrinhamento e turno
          estendido.
        </p>
      </GlassCard>
    );
  }
}
