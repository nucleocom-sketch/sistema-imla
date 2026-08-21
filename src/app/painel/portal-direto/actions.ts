"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { notificarNovaPostagemPublica } from "@/lib/push";

async function exigirGestaoOuNucleo() {
  const sessao = await obterSessao();
  if (!sessao || (sessao.papel !== "ADMIN" && sessao.papel !== "NUCLEO")) {
    throw new Error("Apenas a coordenação e os núcleos podem publicar na Rede Social.");
  }
  return sessao;
}

const urlImagemSchema = z
  .string()
  .refine((v) => v === "" || /^https:\/\//i.test(v) || /^http:\/\//i.test(v), {
    message: "O link da imagem precisa começar com http:// ou https://",
  });

export async function criarPostagemDireta(formData: FormData) {
  const sessao = await exigirGestaoOuNucleo();

  const texto = z.string().min(1).parse(formData.get("texto"));
  const imagemUrl = urlImagemSchema.parse((formData.get("imagemUrl") as string) ?? "");

  await prisma.postagem.create({
    data: {
      nucleo: sessao.papel === "NUCLEO" ? sessao.nucleo : null,
      texto,
      imagemUrl: imagemUrl || null,
      publica: true,
      autorId: sessao.userId,
    },
  });

  revalidatePath("/painel/portal-direto");
  revalidatePath("/rede-social");
  await notificarNovaPostagemPublica(texto);
}

export async function excluirPostagemDireta(formData: FormData) {
  const sessao = await exigirGestaoOuNucleo();
  const id = z.string().parse(formData.get("id"));

  await prisma.postagem.deleteMany({
    where: sessao.papel === "ADMIN" ? { id } : { id, autorId: sessao.userId },
  });

  revalidatePath("/painel/portal-direto");
  revalidatePath("/rede-social");
}
