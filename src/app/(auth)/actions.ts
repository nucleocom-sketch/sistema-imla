"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { criarSessao, destruirSessao } from "@/lib/auth";

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
  const erroGenerico = { erro: "E-mail ou senha incorretos." };

  const usuario = await prisma.usuario.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!usuario) {
    // Mesma mensagem de senha incorreta, para não revelar quais e-mails existem.
    return erroGenerico;
  }

  if (usuario.bloqueadoAte && usuario.bloqueadoAte > new Date()) {
    const minutos = Math.ceil((usuario.bloqueadoAte.getTime() - Date.now()) / 60000);
    return { erro: `Muitas tentativas. Tente novamente em ${minutos} minuto(s).` };
  }

  const senhaOk = await bcrypt.compare(senha, usuario.senhaHash);
  if (!senhaOk) {
    const tentativas = usuario.tentativasFalhas + 1;
    const bloqueado = tentativas >= 5;
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        tentativasFalhas: bloqueado ? 0 : tentativas,
        bloqueadoAte: bloqueado ? new Date(Date.now() + 15 * 60 * 1000) : null,
      },
    });
    if (bloqueado) {
      return { erro: "Muitas tentativas incorretas. Conta bloqueada por 15 minutos." };
    }
    return erroGenerico;
  }

  const destino = formData.get("destino") === "PORTAL" ? "PORTAL" : "PADRINHO";

  // A aba escolhida na tela de login também funciona como controle de acesso:
  // um login de núcleo/coordenação não pode entrar pela aba de Padrinho, e
  // vice-versa — mesmo que a senha esteja certa.
  if (destino === "PADRINHO" && usuario.papel !== "PADRINHO") {
    return erroGenerico;
  }
  if (destino === "PORTAL" && usuario.papel === "PADRINHO") {
    return erroGenerico;
  }

  if (usuario.tentativasFalhas > 0 || usuario.bloqueadoAte) {
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { tentativasFalhas: 0, bloqueadoAte: null },
    });
  }

  await criarSessao({
    userId: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    nucleo: usuario.nucleo,
  });

  redirect(destinoPosLogin(usuario.papel));
}

function destinoPosLogin(papel: string) {
  if (papel === "PADRINHO") return "/painel/apadrinhamento";
  return "/painel/intranet";
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

export async function sair() {
  await destruirSessao();
  redirect("/");
}
