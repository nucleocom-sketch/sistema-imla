import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { GlassCard } from "@/components/ui/GlassCard";
import { NUCLEOS } from "@/lib/config";

export const dynamic = "force-dynamic";

function formatarData(data: Date) {
  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function RedeSocialPage() {
  let postagens: Awaited<ReturnType<typeof buscarPostagens>> = [];
  let erro = false;

  try {
    postagens = await buscarPostagens();
  } catch {
    erro = true;
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-4 py-8 sm:py-12">
      <header className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="Instituto Mãe Lalu" width={140} height={44} className="h-8 w-auto" />
        </Link>
        <Link href="/">
          <span className="rounded-full bg-imla-teal px-4 py-2 text-xs font-bold text-white shadow">
            Entrar
          </span>
        </Link>
      </header>

      <div className="text-center">
        <h1 className="text-2xl font-black">📰 Rede Social do Instituto</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Novidades de todos os núcleos do Instituto Mãe Lalu, em um só lugar.
        </p>
      </div>

      {erro && (
        <GlassCard className="p-8 text-center">
          <p className="text-lg font-extrabold">🔌 Banco de dados ainda não conectado</p>
        </GlassCard>
      )}

      {!erro && postagens.length === 0 && (
        <p className="text-center text-sm text-foreground/50">
          Nenhuma novidade pública por aqui ainda. Volte em breve!
        </p>
      )}

      <div className="flex flex-col gap-5">
        {postagens.map((p) => {
          const cfg = p.nucleo ? NUCLEOS[p.nucleo] : null;
          return (
            <GlassCard key={p.id} hover className="overflow-hidden p-0">
              <div className="flex items-center gap-3 p-4 pb-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-imla-teal/15 text-lg">
                  {cfg ? cfg.icon : "🏠"}
                </span>
                <div>
                  <p className="text-sm font-extrabold">{p.autor.nome}</p>
                  <p className="text-[11px] font-semibold text-foreground/50">
                    {cfg ? cfg.label : "Instituto Mãe Lalu"} · {formatarData(p.criadoEm)}
                  </p>
                </div>
              </div>

              <p className="whitespace-pre-line px-4 py-3 text-sm text-foreground/80">{p.texto}</p>

              {p.imagemUrl && (
                <div className="relative h-72 w-full">
                  <Image src={p.imagemUrl} alt="" fill className="object-cover" unoptimized />
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </main>
  );
}

function buscarPostagens() {
  return prisma.postagem.findMany({
    where: { publica: true },
    include: { autor: { select: { nome: true } } },
    orderBy: { criadoEm: "desc" },
    take: 50,
  });
}
