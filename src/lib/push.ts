import webpush from "web-push";
import { prisma } from "@/lib/db";
import type { Nucleo } from "@prisma/client";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails("mailto:contato@maelalu.org", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

type Payload = { title: string; body: string; url?: string };

async function enviarParaInscricoes(
  inscricoes: { id: string; endpoint: string; p256dh: string; auth: string }[],
  payload: Payload
) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || inscricoes.length === 0) return;
  const corpo = JSON.stringify(payload);

  await Promise.all(
    inscricoes.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          corpo
        );
      } catch (err) {
        // Assinatura expirada/revogada (410/404) — remove do banco. Outras
        // falhas são ignoradas para não travar quem está criando o conteúdo.
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        }
      }
    })
  );
}

// Dispara para todo mundo inscrito sempre que uma novidade pública é
// publicada (Rede Social).
export async function notificarNovaPostagemPublica(texto: string) {
  const inscricoes = await prisma.pushSubscription.findMany();
  await enviarParaInscricoes(inscricoes, {
    title: "📰 Instituto Mãe Lalu",
    body: texto.length > 120 ? `${texto.slice(0, 117)}...` : texto,
    url: "/rede-social",
  });
}

// Notifica apenas quem está inscrito com aquele núcleo marcado (equipe do
// próprio núcleo) — usado para solicitações recebidas e avisos de reunião.
export async function notificarNucleo(nucleo: Nucleo, payload: Payload) {
  const inscricoes = await prisma.pushSubscription.findMany({ where: { nucleo } });
  await enviarParaInscricoes(inscricoes, payload);
}

// Notifica a gestão e todos os núcleos (não os padrinhos/visitantes que só
// se inscreveram pela Rede Social pública) — usado para avisos de reunião
// geral e solicitações "para todos".
export async function notificarTodosOsNucleos(payload: Payload) {
  const inscricoes = await prisma.pushSubscription.findMany({
    where: { papel: { in: ["ADMIN", "NUCLEO"] } },
  });
  await enviarParaInscricoes(inscricoes, payload);
}
