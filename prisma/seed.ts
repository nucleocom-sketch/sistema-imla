import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const senhaHash = await bcrypt.hash("mudar123", 12);

  await prisma.usuario.upsert({
    where: { email: "coordenacao@maelalu.org" },
    create: {
      nome: "Coordenação",
      email: "coordenacao@maelalu.org",
      senhaHash,
      papel: "ADMIN",
    },
    update: {},
  });

  const alunosExemplo = [
    { nome: "Ana Clara Souza", sala: "ROSA" as const, idade: 5, comunidade: "Vila Nova" },
    { nome: "Bento Oliveira", sala: "AMARELA" as const, idade: 6, comunidade: "Beira-Rio" },
    { nome: "Cecília Ramos", sala: "VERDE" as const, idade: 7, comunidade: "Vila Nova" },
    { nome: "Davi Ferreira", sala: "AZUL" as const, idade: 8, comunidade: "Beira-Rio" },
    { nome: "Elis Nascimento", sala: "CIRANDA_MUNDO" as const, idade: 9, comunidade: "Porto Alto" },
  ];

  for (const aluno of alunosExemplo) {
    const existente = await prisma.aluno.findFirst({ where: { nome: aluno.nome } });
    if (!existente) {
      await prisma.aluno.create({ data: aluno });
    }
  }

  console.log("Seed concluído: usuário coordenacao@maelalu.org / senha mudar123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
