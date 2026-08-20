"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";

const inscricaoSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function inscreverPush(inscricao: unknown) {
  const { endpoint, keys } = inscricaoSchema.parse(inscricao);

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { p256dh: keys.p256dh, auth: keys.auth },
    create: { endpoint, p256dh: keys.p256dh, auth: keys.auth },
  });
}

export async function cancelarInscricaoPush(endpoint: string) {
  await prisma.pushSubscription.delete({ where: { endpoint } }).catch(() => {});
}
