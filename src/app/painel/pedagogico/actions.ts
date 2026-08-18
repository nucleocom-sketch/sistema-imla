"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { obterSessao } from "@/lib/auth";
import { CATEGORIAS_MARE } from "@/lib/config";
import type { Sala, NivelAlfabetizacao, EtapaAvaliacao } from "@prisma/client";

async function exigirAdmin() {
  const sessao = await obterSessao();
  if (!sessao || sessao.papel !== "ADMIN") {
    throw new Error("Apenas a coordenação pode fazer isso.");
  }
  return sessao;
}

export async function matricularAluno(formData: FormData) {
  await exigirAdmin();

  const nome = z.string().min(1).parse(formData.get("nome"));
  const sala = z.string().parse(formData.get("sala")) as Sala;
  const idadeRaw = formData.get("idade") as string;
  const comunidade = (formData.get("comunidade") as string) ?? "";
  const turma = (formData.get("turma") as string) ?? "";

  await prisma.aluno.create({
    data: {
      nome: nome.trim(),
      sala,
      idade: idadeRaw ? Number(idadeRaw) : null,
      comunidade: comunidade.trim() || null,
      turma: turma.trim() || null,
    },
  });

  revalidatePath("/painel/pedagogico/matriculas");
}

export async function definirPadrinho(formData: FormData) {
  await exigirAdmin();

  const alunoId = z.string().parse(formData.get("alunoId"));
  const padrinho = z.string().min(1).parse(formData.get("padrinho")).trim();
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const senha = (formData.get("senha") as string) ?? "";

  await prisma.aluno.update({
    where: { id: alunoId },
    data: { padrinho },
  });

  if (email) {
    const existente = await prisma.usuario.findUnique({ where: { email } });

    if (existente) {
      // Vincula uma conta já auto-cadastrada pelo padrinho/madrinha (sem mexer na senha).
      await prisma.usuario.update({
        where: { email },
        data: { nome: padrinho, papel: "PADRINHO" },
      });
    } else if (senha) {
      const bcrypt = (await import("bcryptjs")).default;
      const senhaHash = await bcrypt.hash(senha, 12);

      await prisma.usuario.create({
        data: { nome: padrinho, email, senhaHash, papel: "PADRINHO" },
      });
    }
  }

  revalidatePath("/painel/pedagogico/matriculas");
}

export async function matricularTurnoEstendido(formData: FormData) {
  await exigirAdmin();

  const alunoId = z.string().parse(formData.get("alunoId"));

  await prisma.matriculaTurnoEstendido.create({
    data: { alunoId },
  });

  revalidatePath("/painel/pedagogico/matriculas");
  revalidatePath("/painel/pedagogico/turno-estendido");
}

export async function salvarAvaliacaoAlfabetizacao(formData: FormData) {
  await exigirAdmin();

  const alunoId = z.string().parse(formData.get("alunoId"));
  const ano = z.coerce.number().parse(formData.get("ano"));
  const etapa = z.string().parse(formData.get("etapa")) as EtapaAvaliacao;
  const nivel = z.string().parse(formData.get("nivel")) as NivelAlfabetizacao;
  const evidencias = formData.getAll("evidencias").map(String);
  const observacoes = (formData.get("observacoes") as string) ?? "";

  await prisma.avaliacaoAlfabetizacao.upsert({
    where: { alunoId_ano_etapa: { alunoId, ano, etapa } },
    create: { alunoId, ano, etapa, nivel, evidencias, observacoes },
    update: { nivel, evidencias, observacoes },
  });

  revalidatePath("/painel/pedagogico/turno-estendido");
}

export async function salvarAvaliacaoMare(formData: FormData) {
  await exigirAdmin();

  const alunoId = z.string().parse(formData.get("alunoId"));
  const semestre = z.string().min(1).parse(formData.get("semestre"));
  const observacoes = (formData.get("observacoes") as string) ?? "";

  const notas = CATEGORIAS_MARE.map((_, i) => z.string().parse(formData.get(`nota_${i}`)));

  await prisma.avaliacaoMare.upsert({
    where: { alunoId_semestre: { alunoId, semestre } },
    create: { alunoId, semestre, notas, observacoes },
    update: { notas, observacoes },
  });

  revalidatePath("/painel/pedagogico/tabua-da-mare");
}
