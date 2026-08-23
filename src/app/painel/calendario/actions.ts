"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { obterSessao } from "@/lib/auth";

async function exigirAdmin() {
  const sessao = await obterSessao();
  if (!sessao || sessao.papel !== "ADMIN") {
    throw new Error("Apenas a coordenação pode alterar o calendário institucional.");
  }
  return sessao;
}

export async function criarEvento(formData: FormData) {
  const sessao = await exigirAdmin();

  const titulo = z.string().min(1).parse(formData.get("titulo"));
  const descricao = (formData.get("descricao") as string) ?? "";
  const data = z.string().min(1).parse(formData.get("data"));

  await prisma.eventoCalendario.create({
    data: { titulo, descricao, data: new Date(data), autorId: sessao.userId },
  });

  revalidatePath("/painel/calendario");
}

export async function excluirEvento(formData: FormData) {
  await exigirAdmin();
  const id = z.string().parse(formData.get("id"));

  await prisma.eventoCalendario.delete({ where: { id } });
  revalidatePath("/painel/calendario");
}
