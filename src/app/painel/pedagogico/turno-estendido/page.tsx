import { prisma } from "@/lib/db";
import { GlassCard } from "@/components/ui/GlassCard";
import { TurnoEstendidoView } from "@/components/pedagogico/TurnoEstendidoView";

export default async function TurnoEstendidoPage() {
  try {
    const alunos = await prisma.aluno.findMany({
      where: { matriculaTurnoEstendido: { isNot: null } },
      include: {
        avaliacoesAlfabetizacao: { orderBy: [{ ano: "asc" }, { etapa: "asc" }] },
      },
      orderBy: { nome: "asc" },
    });

    return <TurnoEstendidoView alunos={alunos} />;
  } catch {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-lg font-extrabold">🔌 Banco de dados ainda não conectado</p>
        <p className="mt-2 text-sm text-foreground/60">
          Assim que a connection string do Postgres for configurada, esta tela vai
          mostrar o diagnóstico de alfabetização e a trilha de desenvolvimento de
          cada criança do Turno Estendido.
        </p>
      </GlassCard>
    );
  }
}
