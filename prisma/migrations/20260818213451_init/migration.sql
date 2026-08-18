-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('ADMIN', 'NUCLEO', 'PADRINHO', 'VISITANTE');

-- CreateEnum
CREATE TYPE "Nucleo" AS ENUM ('COZINHA', 'COMUNICACAO', 'PEDAGOGICO', 'CAPTACAO', 'FINANCEIRO', 'APADRINHAMENTO');

-- CreateEnum
CREATE TYPE "Sala" AS ENUM ('ROSA', 'AMARELA', 'VERDE', 'AZUL', 'CIRANDA_MUNDO');

-- CreateEnum
CREATE TYPE "StatusTarefa" AS ENUM ('CRIADA', 'EM_ANDAMENTO', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "Prioridade" AS ENUM ('BAIXA', 'MEDIA', 'ALTA');

-- CreateEnum
CREATE TYPE "NivelAlfabetizacao" AS ENUM ('PRE_SILABICO', 'SILABICO_SEM_VALOR', 'SILABICO_COM_VALOR', 'SILABICO_ALFABETICO', 'ALFABETICO_INICIAL', 'ALFABETICO_FINAL', 'ALFABETICO_ORTOGRAFICO');

-- CreateEnum
CREATE TYPE "EtapaAvaliacao" AS ENUM ('PRIMEIRA', 'SEGUNDA', 'FINAL');

-- CreateEnum
CREATE TYPE "NivelMare" AS ENUM ('BAIXA', 'VAZANTE', 'ENCHENTE', 'ALTA', 'CHEIA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" "Papel" NOT NULL DEFAULT 'NUCLEO',
    "nucleo" "Nucleo",
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aluno" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "idade" INTEGER,
    "comunidade" TEXT,
    "turma" TEXT,
    "sala" "Sala" NOT NULL,
    "padrinho" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Aluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatriculaTurnoEstendido" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatriculaTurnoEstendido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvaliacaoAlfabetizacao" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "etapa" "EtapaAvaliacao" NOT NULL,
    "nivel" "NivelAlfabetizacao" NOT NULL,
    "evidencias" TEXT[],
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvaliacaoAlfabetizacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvaliacaoMare" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "semestre" TEXT NOT NULL,
    "notas" JSONB NOT NULL,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvaliacaoMare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Postagem" (
    "id" TEXT NOT NULL,
    "nucleo" "Nucleo" NOT NULL,
    "texto" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Postagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarefa" (
    "id" TEXT NOT NULL,
    "nucleo" "Nucleo" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "status" "StatusTarefa" NOT NULL DEFAULT 'CRIADA',
    "prioridade" "Prioridade" NOT NULL DEFAULT 'MEDIA',
    "autorId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tarefa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lembrete" (
    "id" TEXT NOT NULL,
    "nucleo" "Nucleo" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "proximaData" TIMESTAMP(3) NOT NULL,
    "autorId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lembrete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solicitacao" (
    "id" TEXT NOT NULL,
    "nucleoDestino" "Nucleo" NOT NULL,
    "assunto" TEXT NOT NULL,
    "mensagem" TEXT,
    "publica" BOOLEAN NOT NULL DEFAULT false,
    "deId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Solicitacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MatriculaTurnoEstendido_alunoId_key" ON "MatriculaTurnoEstendido"("alunoId");

-- CreateIndex
CREATE UNIQUE INDEX "AvaliacaoAlfabetizacao_alunoId_ano_etapa_key" ON "AvaliacaoAlfabetizacao"("alunoId", "ano", "etapa");

-- CreateIndex
CREATE UNIQUE INDEX "AvaliacaoMare_alunoId_semestre_key" ON "AvaliacaoMare"("alunoId", "semestre");

-- AddForeignKey
ALTER TABLE "MatriculaTurnoEstendido" ADD CONSTRAINT "MatriculaTurnoEstendido_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoAlfabetizacao" ADD CONSTRAINT "AvaliacaoAlfabetizacao_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoMare" ADD CONSTRAINT "AvaliacaoMare_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postagem" ADD CONSTRAINT "Postagem_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lembrete" ADD CONSTRAINT "Lembrete_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitacao" ADD CONSTRAINT "Solicitacao_deId_fkey" FOREIGN KEY ("deId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
