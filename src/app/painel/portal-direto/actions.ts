"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { obterSessao } from "@/lib/auth";

async function exigirAdmin() {
  const sessao = await obterSessao();
  if (!sessao || sessao.papel !== "ADMIN") {
    throw new Error("Apenas a coordenação pode publicar direto na Rede Social.");
  }
  return sessao;
}

const urlImagemSchema = z
  .string()
  .refine((v) => v === "" || /^https:\/\//i.test(v) || /^http:\/\//i.test(v), {
    message: "O link da imagem precisa começar com http:// ou https://",
  });

export async function criarPostagemDireta(formData: FormData) {
  const sessao = await exigirAdmin();

  const texto = z.string().min(1).parse(formData.get("texto"));
  const imagemUrl = urlImagemSchema.parse((formData.get("imagemUrl") as string) ?? "");

  await prisma.postagem.create({
    data: {
      nucleo: null,
      texto,
      imagemUrl: imagemUrl || null,
      publica: true,
      autorId: sessao.userId,
    },
  });

  revalidatePath("/painel/portal-direto");
  revalidatePath("/rede-social");
}

export async function excluirPostagemDireta(formData: FormData) {
  await exigirAdmin();
  const id = z.string().parse(formData.get("id"));

  await prisma.postagem.delete({ where: { id } });

  revalidatePath("/painel/portal-direto");
  revalidatePath("/rede-social");
}
