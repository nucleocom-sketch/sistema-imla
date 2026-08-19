"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import type { Nucleo, StatusTarefa, Prioridade } from "@prisma/client";

async function exigirMembroDoNucleo(nucleo: Nucleo) {
  const sessao = await obterSessao();
  if (!sessao) throw new Error("Não autenticado.");
  const permitido = sessao.papel === "ADMIN" || (sessao.papel === "NUCLEO" && sessao.nucleo === nucleo);
  if (!permitido) throw new Error("Sem permissão para este núcleo.");
  return sessao;
}

function lerPublico(formData: FormData) {
  const publica = formData.get("publica") === "true";
  const confirmou = formData.get("confirmouPublico") === "true";
  if (publica && !confirmou) {
    throw new Error("Confirme que deseja tornar isso público antes de salvar.");
  }
  return publica;
}

const urlImagemSchema = z
  .string()
  .refine((v) => v === "" || /^https:\/\//i.test(v) || /^http:\/\//i.test(v), {
    message: "O link da imagem precisa começar com http:// ou https://",
  });

export async function criarPostagem(formData: FormData) {
  const nucleo = formData.get("nucleo") as Nucleo;
  const sessao = await exigirMembroDoNucleo(nucleo);

  const texto = z.string().min(1).parse(formData.get("texto"));
  const publica = lerPublico(formData);
  const imagemUrl = urlImagemSchema.parse((formData.get("imagemUrl") as string) ?? "");

  await prisma.postagem.create({
    data: { nucleo, texto, publica, imagemUrl: imagemUrl || null, autorId: sessao.userId },
  });

  revalidatePath("/painel/intranet");
  revalidatePath("/rede-social");
}

export async function criarTarefa(formData: FormData) {
  const nucleo = formData.get("nucleo") as Nucleo;
  const sessao = await exigirMembroDoNucleo(nucleo);

  const titulo = z.string().min(1).parse(formData.get("titulo"));
  const descricao = (formData.get("descricao") as string) ?? "";
  const prioridade = (formData.get("prioridade") as Prioridade) ?? "MEDIA";

  await prisma.tarefa.create({
    data: { nucleo, titulo, descricao, prioridade, autorId: sessao.userId },
  });

  revalidatePath("/painel/intranet");
}

export async function atualizarTarefa(formData: FormData) {
  const id = z.string().parse(formData.get("id"));
  const nucleo = formData.get("nucleo") as Nucleo;
  await exigirMembroDoNucleo(nucleo);

  const titulo = z.string().min(1).parse(formData.get("titulo"));
  const descricao = (formData.get("descricao") as string) ?? "";
  const status = formData.get("status") as StatusTarefa;
  const prioridade = formData.get("prioridade") as Prioridade;

  await prisma.tarefa.update({
    where: { id },
    data: { titulo, descricao, status, prioridade },
  });

  revalidatePath("/painel/intranet");
}

export async function excluirTarefa(formData: FormData) {
  const id = z.string().parse(formData.get("id"));
  const nucleo = formData.get("nucleo") as Nucleo;
  await exigirMembroDoNucleo(nucleo);

  await prisma.tarefa.delete({ where: { id } });
  revalidatePath("/painel/intranet");
}

export async function criarLembrete(formData: FormData) {
  const nucleo = formData.get("nucleo") as Nucleo;
  const sessao = await exigirMembroDoNucleo(nucleo);

  const titulo = z.string().min(1).parse(formData.get("titulo"));
  const descricao = (formData.get("descricao") as string) ?? "";
  const proximaData = z.string().min(1).parse(formData.get("proximaData"));
  const publica = lerPublico(formData);

  await prisma.lembrete.create({
    data: {
      nucleo,
      titulo,
      descricao,
      proximaData: new Date(proximaData),
      publica,
      autorId: sessao.userId,
    },
  });

  revalidatePath("/painel/intranet");
}

export async function atualizarLembrete(formData: FormData) {
  const id = z.string().parse(formData.get("id"));
  const nucleo = formData.get("nucleo") as Nucleo;
  await exigirMembroDoNucleo(nucleo);

  const titulo = z.string().min(1).parse(formData.get("titulo"));
  const descricao = (formData.get("descricao") as string) ?? "";
  const proximaData = z.string().min(1).parse(formData.get("proximaData"));

  await prisma.lembrete.update({
    where: { id },
    data: { titulo, descricao, proximaData: new Date(proximaData) },
  });

  revalidatePath("/painel/intranet");
}

export async function excluirLembrete(formData: FormData) {
  const id = z.string().parse(formData.get("id"));
  const nucleo = formData.get("nucleo") as Nucleo;
  await exigirMembroDoNucleo(nucleo);

  await prisma.lembrete.delete({ where: { id } });
  revalidatePath("/painel/intranet");
}

const urlSchema = z
  .string()
  .min(1)
  .refine((v) => /^https:\/\//i.test(v) || /^http:\/\//i.test(v), {
    message: "O link precisa começar com http:// ou https://",
  });

export async function criarLink(formData: FormData) {
  const nucleo = formData.get("nucleo") as Nucleo;
  const sessao = await exigirMembroDoNucleo(nucleo);

  const titulo = z.string().min(1).max(60).parse(formData.get("titulo"));
  const url = urlSchema.parse(formData.get("url"));
  const publico = formData.get("publico") === "true";
  const confirmouPublico = formData.get("confirmouPublico") === "true";

  if (publico && !confirmouPublico) {
    throw new Error("Confirme que deseja tornar este link público antes de salvar.");
  }

  await prisma.linkNucleo.create({
    data: { nucleo, titulo, url, publico, autorId: sessao.userId },
  });

  revalidatePath("/painel/intranet");
}

export async function excluirLink(formData: FormData) {
  const id = z.string().parse(formData.get("id"));
  const nucleo = formData.get("nucleo") as Nucleo;
  await exigirMembroDoNucleo(nucleo);

  await prisma.linkNucleo.delete({ where: { id } });
  revalidatePath("/painel/intranet");
}

export async function enviarSolicitacao(formData: FormData) {
  const nucleoOrigem = formData.get("nucleoOrigem") as Nucleo;
  const sessao = await exigirMembroDoNucleo(nucleoOrigem);

  const nucleoDestino = z.string().parse(formData.get("nucleoDestino")) as Nucleo;
  const assunto = z.string().min(1).parse(formData.get("assunto"));
  const mensagem = (formData.get("mensagem") as string) ?? "";
  const publica = formData.get("publica") === "true";

  await prisma.solicitacao.create({
    data: { nucleoDestino, assunto, mensagem, publica, deId: sessao.userId },
  });

  revalidatePath("/painel/intranet");
}
