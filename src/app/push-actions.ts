"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { obterSessao } from "@/lib/auth";

const inscricaoSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function inscreverPush(inscricao: unknown) {
  const { endpoint, keys } = inscricaoSchema.parse(inscricao);
  const sessao = await obterSessao();

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: {
      p256dh: keys.p256dh,
      auth: keys.auth,
      papel: sessao?.papel ?? null,
      nucleo: sessao?.nucleo ?? null,
    },
    create: {
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      papel: sessao?.papel ?? null,
      nucleo: sessao?.nucleo ?? null,
    },
  });
}

export async function cancelarInscricaoPush(endpoint: string) {
  await prisma.pushSubscription.delete({ where: { endpoint } }).catch(() => {});
}
