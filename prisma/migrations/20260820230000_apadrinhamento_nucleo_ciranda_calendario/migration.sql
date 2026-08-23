-- CreateEnum
CREATE TYPE "Recorrencia" AS ENUM ('NENHUMA', 'MENSAL');

-- AlterEnum
ALTER TYPE "Nucleo" ADD VALUE 'APADRINHAMENTO';

-- AlterTable
ALTER TABLE "PushSubscription" ADD COLUMN     "nucleo" "Nucleo";

-- AlterTable
ALTER TABLE "Solicitacao" ALTER COLUMN "nucleoDestino" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Tarefa" ADD COLUMN     "anexos" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "diaRecorrencia" INTEGER,
ADD COLUMN     "prazo" TIMESTAMP(3),
ADD COLUMN     "recorrencia" "Recorrencia" NOT NULL DEFAULT 'NENHUMA',
ADD COLUMN     "ultimoVencimentoNotificado" TEXT;

-- CreateTable
CREATE TABLE "Ciranda" (
    "id" TEXT NOT NULL,
    "semana" TEXT NOT NULL,
    "tema" TEXT NOT NULL,
    "desenvolvimento" TEXT NOT NULL,
    "anexos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "autorId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ciranda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoCalendario" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "autorId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoCalendario_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ciranda" ADD CONSTRAINT "Ciranda_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoCalendario" ADD CONSTRAINT "EventoCalendario_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
