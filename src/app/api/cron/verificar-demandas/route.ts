import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { notificarNucleo } from "@/lib/push";

// Roda uma vez por dia (ver vercel.json). Avisa o núcleo quando uma demanda
// com prazo final vence, ou quando chega o dia marcado de uma demanda
// mensal — cada uma só notifica uma vez por vencimento/mês, guardado em
// ultimoVencimentoNotificado.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }
  }

  const hoje = new Date();
  const hojeUTC = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate()));
  const mesAtual = `${hoje.getUTCFullYear()}-${String(hoje.getUTCMonth() + 1).padStart(2, "0")}`;

  const tarefas = await prisma.tarefa.findMany({
    where: { status: { not: "CONCLUIDA" } },
  });

  let notificadas = 0;

  for (const t of tarefas) {
    if (t.prazo && new Date(t.prazo) <= hojeUTC && t.ultimoVencimentoNotificado !== t.id + "-prazo") {
      await notificarNucleo(t.nucleo, {
        title: "⚠️ Demanda vencida",
        body: t.titulo,
        url: "/painel/intranet",
      });
      await prisma.tarefa.update({
        where: { id: t.id },
        data: { ultimoVencimentoNotificado: `${t.id}-prazo` },
      });
      notificadas++;
      continue;
    }

    if (
      t.recorrencia === "MENSAL" &&
      t.diaRecorrencia !== null &&
      hoje.getUTCDate() >= t.diaRecorrencia &&
      t.ultimoVencimentoNotificado !== mesAtual
    ) {
      await notificarNucleo(t.nucleo, {
        title: "🔁 Demanda mensal vencendo",
        body: t.titulo,
        url: "/painel/intranet",
      });
      await prisma.tarefa.update({
        where: { id: t.id },
        data: { ultimoVencimentoNotificado: mesAtual },
      });
      notificadas++;
    }
  }

  return NextResponse.json({ ok: true, notificadas });
}
