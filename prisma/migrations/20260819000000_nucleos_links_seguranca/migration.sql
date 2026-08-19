-- AlterEnum
BEGIN;
CREATE TYPE "Nucleo_new" AS ENUM ('ADMINISTRATIVO_FINANCEIRO', 'PROJETOS_CAPTACAO', 'JURIDICO_SOCIAL', 'TECNOLOGIA_COMUNICACAO', 'ESPORTE_LAZER', 'PEDAGOGICO', 'SAUDE_MEIO_AMBIENTE', 'APOIO_INFRAESTRUTURA');
ALTER TABLE "Usuario" ALTER COLUMN "nucleo" TYPE "Nucleo_new" USING ("nucleo"::text::"Nucleo_new");
ALTER TABLE "Postagem" ALTER COLUMN "nucleo" TYPE "Nucleo_new" USING ("nucleo"::text::"Nucleo_new");
ALTER TABLE "Tarefa" ALTER COLUMN "nucleo" TYPE "Nucleo_new" USING ("nucleo"::text::"Nucleo_new");
ALTER TABLE "Lembrete" ALTER COLUMN "nucleo" TYPE "Nucleo_new" USING ("nucleo"::text::"Nucleo_new");
ALTER TABLE "Solicitacao" ALTER COLUMN "nucleoDestino" TYPE "Nucleo_new" USING ("nucleoDestino"::text::"Nucleo_new");
ALTER TYPE "Nucleo" RENAME TO "Nucleo_old";
ALTER TYPE "Nucleo_new" RENAME TO "Nucleo";
DROP TYPE "public"."Nucleo_old";
COMMIT;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "bloqueadoAte" TIMESTAMP(3),
ADD COLUMN     "tentativasFalhas" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "LinkNucleo" (
    "id" TEXT NOT NULL,
    "nucleo" "Nucleo" NOT NULL,
    "titulo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publico" BOOLEAN NOT NULL DEFAULT false,
    "autorId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkNucleo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LinkNucleo" ADD CONSTRAINT "LinkNucleo_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
