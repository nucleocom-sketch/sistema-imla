"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { enviarAnexos } from "@/lib/blob";
import { notificarNucleo, notificarTodosOsNucleos } from "@/lib/push";
import { NUCLEOS } from "@/lib/config";
import type { Nucleo, StatusTarefa, Prioridade, Recorrencia } from "@prisma/client";

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

export async function criarTarefa(formData: FormData) {
  const nucleo = formData.get("nucleo") as Nucleo;
  const sessao = await exigirMembroDoNucleo(nucleo);

  const titulo = z.string().min(1).parse(formData.get("titulo"));
  const descricao = (formData.get("descricao") as string) ?? "";
  const prioridade = (formData.get("prioridade") as Prioridade) ?? "MEDIA";
  const publica = lerPublico(formData);

  const tipoPrazo = (formData.get("tipoPrazo") as string) ?? "SEM_PRAZO";
  const recorrencia: Recorrencia = tipoPrazo === "MENSAL" ? "MENSAL" : "NENHUMA";
  const prazoRaw = (formData.get("prazo") as string) ?? "";
  const prazo = tipoPrazo === "PRAZO_FINAL" && prazoRaw ? new Date(prazoRaw) : null;
  const diaRecorrencia =
    tipoPrazo === "MENSAL" ? z.coerce.number().int().min(1).max(31).parse(formData.get("diaRecorrencia")) : null;

  const anexos = await enviarAnexos(formData, "anexos");

  await prisma.tarefa.create({
    data: { nucleo, titulo, descricao, prioridade, publica, prazo, recorrencia, diaRecorrencia, anexos, autorId: sessao.userId },
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

  const nucleoDestinoRaw = z.string().parse(formData.get("nucleoDestino"));
  const nucleoDestino = nucleoDestinoRaw === "TODOS" ? null : (nucleoDestinoRaw as Nucleo);
  const assunto = z.string().min(1).parse(formData.get("assunto"));
  const mensagem = (formData.get("mensagem") as string) ?? "";
  const publica = formData.get("publica") === "true";

  await prisma.solicitacao.create({
    data: { nucleoDestino, assunto, mensagem, publica, deId: sessao.userId },
  });

  const payload = {
    title: "📥 Nova solicitação",
    body: `${NUCLEOS[nucleoOrigem].label}: ${assunto}`,
    url: "/painel/intranet",
  };
  if (nucleoDestino) {
    await notificarNucleo(nucleoDestino, payload);
  } else {
    await notificarTodosOsNucleos(payload);
  }

  revalidatePath("/painel/intranet");
}

export async function enviarNotificacaoReuniao(formData: FormData) {
  const nucleoOrigem = formData.get("nucleoOrigem") as Nucleo;
  await exigirMembroDoNucleo(nucleoOrigem);

  const titulo = z.string().min(1).parse(formData.get("titulo"));
  const detalhes = (formData.get("detalhes") as string) ?? "";
  const alcance = formData.get("alcance") === "TODOS" ? "TODOS" : "NUCLEO";

  const payload = {
    title: `📅 ${titulo}`,
    body: detalhes || `Aviso de reunião do ${NUCLEOS[nucleoOrigem].label}.`,
    url: "/painel/intranet",
  };

  if (alcance === "TODOS") {
    await notificarTodosOsNucleos(payload);
  } else {
    await notificarNucleo(nucleoOrigem, payload);
  }
}

async function exigirPedagogicoOuAdmin() {
  const sessao = await obterSessao();
  if (!sessao || (sessao.papel !== "ADMIN" && !(sessao.papel === "NUCLEO" && sessao.nucleo === "PEDAGOGICO"))) {
    throw new Error("Apenas a coordenação e o núcleo pedagógico podem fazer isso.");
  }
  return sessao;
}

export async function criarCiranda(formData: FormData) {
  const sessao = await exigirPedagogicoOuAdmin();

  const semana = z.string().min(1).parse(formData.get("semana"));
  const tema = z.string().min(1).parse(formData.get("tema"));
  const desenvolvimento = z.string().min(1).parse(formData.get("desenvolvimento"));
  const anexos = await enviarAnexos(formData, "anexos");

  await prisma.ciranda.create({
    data: { semana, tema, desenvolvimento, anexos, autorId: sessao.userId },
  });

  revalidatePath("/painel/intranet");
}

export async function excluirCiranda(formData: FormData) {
  await exigirPedagogicoOuAdmin();
  const id = z.string().parse(formData.get("id"));

  await prisma.ciranda.delete({ where: { id } });
  revalidatePath("/painel/intranet");
}
