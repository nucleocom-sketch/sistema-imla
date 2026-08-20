import webpush from "web-push";
import { prisma } from "@/lib/db";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails("mailto:contato@maelalu.org", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// Dispara uma notificação para todo mundo inscrito sempre que uma novidade
// pública é publicada (Rede Social). Falhas por assinatura expirada/revogada
// (410/404) removem a inscrição do banco; outras falhas apenas são ignoradas
// para não derrubar a criação da postagem.
export async function notificarNovaPostagemPublica(texto: string) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;

  const inscricoes = await prisma.pushSubscription.findMany();
  if (inscricoes.length === 0) return;

  const payload = JSON.stringify({
    title: "📰 Instituto Mãe Lalu",
    body: texto.length > 120 ? `${texto.slice(0, 117)}...` : texto,
    url: "/rede-social",
  });

  await Promise.all(
    inscricoes.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        );
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        }
      }
    })
  );
}
