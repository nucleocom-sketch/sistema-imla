import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CalendarioView } from "@/components/calendario/CalendarioView";
import { GlassCard } from "@/components/ui/GlassCard";

export default async function CalendarioPage() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/");
  if (sessao.papel === "PADRINHO") redirect("/painel");

  try {
    const eventos = await prisma.eventoCalendario.findMany({
      include: { autor: { select: { nome: true } } },
      orderBy: { data: "asc" },
    });

    return <CalendarioView eventos={eventos} podeEditar={sessao.papel === "ADMIN"} />;
  } catch {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-lg font-extrabold">🔌 Banco de dados ainda não conectado</p>
      </GlassCard>
    );
  }
}
