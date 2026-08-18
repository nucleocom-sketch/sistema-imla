"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { criarSessao, destruirSessao } from "@/lib/auth";
import type { Nucleo } from "@prisma/client";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  senha: z.string().min(1, "Informe a senha"),
});

export type FormState = { erro?: string } | null;

export async function entrar(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { email, senha } = parsed.data;

  const usuario = await prisma.usuario.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!usuario) {
    return { erro: "E-mail não encontrado." };
  }

  const senhaOk = await bcrypt.compare(senha, usuario.senhaHash);
  if (!senhaOk) {
    return { erro: "Senha incorreta." };
  }

  await criarSessao({
    userId: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    nucleo: usuario.nucleo,
  });

  const destino = formData.get("destino") === "PEDAGOGICO" ? "PEDAGOGICO" : "INTRANET";
  redirect(destinoPosLogin(usuario.papel, destino));
}

function destinoPosLogin(papel: string, destino: "INTRANET" | "PEDAGOGICO") {
  if (papel === "PADRINHO") return "/painel/apadrinhamento";
  if (papel === "NUCLEO") return "/painel/intranet";
  if (papel === "ADMIN") return destino === "PEDAGOGICO" ? "/painel/pedagogico" : "/painel/intranet";
  return "/painel/intranet";
}

const cadastroSchema = z.object({
  nome: z.string().min(2, "Informe seu nome completo"),
  email: z.string().email("Informe um e-mail válido"),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
  confirmarSenha: z.string(),
  nucleo: z.string(),
});

export async function cadastrar(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = cadastroSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    senha: formData.get("senha"),
    confirmarSenha: formData.get("confirmarSenha"),
    nucleo: formData.get("nucleo"),
  });

  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { nome, email, senha, confirmarSenha, nucleo } = parsed.data;

  if (senha !== confirmarSenha) {
    return { erro: "As senhas não coincidem." };
  }

  const emailNormalizado = email.trim().toLowerCase();

  const existente = await prisma.usuario.findUnique({ where: { email: emailNormalizado } });
  if (existente) {
    return { erro: "Este e-mail já está cadastrado." };
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  const usuario = await prisma.usuario.create({
    data: {
      nome: nome.trim(),
      email: emailNormalizado,
      senhaHash,
      papel: "NUCLEO",
      nucleo: nucleo as Nucleo,
    },
  });

  await criarSessao({
    userId: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    nucleo: usuario.nucleo,
  });

  redirect("/painel/intranet");
}

const cadastroPadrinhoSchema = z.object({
  nome: z.string().min(2, "Informe seu nome completo"),
  email: z.string().email("Informe um e-mail válido"),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
  confirmarSenha: z.string(),
});

export async function cadastrarPadrinho(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = cadastroPadrinhoSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    senha: formData.get("senha"),
    confirmarSenha: formData.get("confirmarSenha"),
  });

  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { nome, email, senha, confirmarSenha } = parsed.data;

  if (senha !== confirmarSenha) {
    return { erro: "As senhas não coincidem." };
  }

  const emailNormalizado = email.trim().toLowerCase();

  const existente = await prisma.usuario.findUnique({ where: { email: emailNormalizado } });
  if (existente) {
    return { erro: "Este e-mail já está cadastrado." };
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  const usuario = await prisma.usuario.create({
    data: {
      nome: nome.trim(),
      email: emailNormalizado,
      senhaHash,
      papel: "PADRINHO",
    },
  });

  await criarSessao({
    userId: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    nucleo: usuario.nucleo,
  });

  redirect("/painel/apadrinhamento");
}

export async function entrarComoVisitante() {
  await criarSessao({
    userId: "visitante",
    nome: "Visitante",
    email: "",
    papel: "VISITANTE",
    nucleo: null,
  });
  redirect("/painel/intranet");
}

export async function sair() {
  await destruirSessao();
  redirect("/");
}
