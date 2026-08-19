import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GlassCard } from "@/components/ui/GlassCard";
import { PortalDiretoView } from "@/components/portal-direto/PortalDiretoView";

export default async function PortalDiretoPage() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/");
  if (sessao.papel !== "ADMIN") redirect("/painel");

  try {
    const postagens = await prisma.postagem.findMany({
      where: { nucleo: null },
      include: { autor: { select: { nome: true } } },
      orderBy: { criadoEm: "desc" },
      take: 30,
    });

    return <PortalDiretoView postagens={postagens} />;
  } catch {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-lg font-extrabold">🔌 Banco de dados ainda não conectado</p>
      </GlassCard>
    );
  }
}
