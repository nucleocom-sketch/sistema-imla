"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { obterSessao } from "@/lib/auth";

async function exigirGestaoOuNucleo() {
  const sessao = await obterSessao();
  if (!sessao || (sessao.papel !== "ADMIN" && sessao.papel !== "NUCLEO")) {
    throw new Error("Apenas a coordenação e os núcleos podem alterar o calendário institucional.");
  }
  return sessao;
}

export async function criarEvento(formData: FormData) {
  const sessao = await exigirGestaoOuNucleo();

  const titulo = z.string().min(1).parse(formData.get("titulo"));
  const descricao = (formData.get("descricao") as string) ?? "";
  const data = z.string().min(1).parse(formData.get("data"));

  await prisma.eventoCalendario.create({
    data: { titulo, descricao, data: new Date(data), autorId: sessao.userId },
  });

  revalidatePath("/painel/calendario");
}

export async function excluirEvento(formData: FormData) {
  const sessao = await exigirGestaoOuNucleo();
  const id = z.string().parse(formData.get("id"));

  // Núcleos só podem apagar as próprias atividades — a coordenação pode
  // apagar qualquer uma.
  await prisma.eventoCalendario.deleteMany({
    where: sessao.papel === "ADMIN" ? { id } : { id, autorId: sessao.userId },
  });
  revalidatePath("/painel/calendario");
}
