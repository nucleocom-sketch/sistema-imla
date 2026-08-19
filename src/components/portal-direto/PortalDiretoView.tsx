"use client";

import Image from "next/image";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { criarPostagemDireta, excluirPostagemDireta } from "@/app/painel/portal-direto/actions";

type Postagem = {
  id: string;
  texto: string;
  imagemUrl: string | null;
  criadoEm: Date;
  autor: { nome: string };
};

function formatarData(data: Date) {
  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PortalDiretoView({ postagens }: { postagens: Postagem[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black">📸 Postar na Rede Social</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Essas postagens vão direto para o feed público, sem passar por nenhum
          núcleo específico — aparecem como novidades do Instituto Mãe Lalu.
        </p>
      </div>

      <GlassCard className="p-5">
        <form action={criarPostagemDireta} className="flex flex-col gap-3">
          <textarea
            name="texto"
            required
            rows={4}
            placeholder="Escreva a novidade que vai aparecer na Rede Social..."
            className="w-full rounded-xl border border-foreground/10 bg-white/70 p-3 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
          />
          <input
            name="imagemUrl"
            type="url"
            placeholder="Link de uma foto (opcional) — https://..."
            className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-sm outline-none ring-imla-accent/40 focus:ring-2 dark:bg-white/5"
          />
          <Button type="submit" className="self-end">
            📰 Publicar na Rede Social
          </Button>
        </form>
      </GlassCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {postagens.map((p) => (
          <GlassCard key={p.id} className="overflow-hidden p-0">
            {p.imagemUrl && (
              <div className="relative h-40 w-full">
                <Image src={p.imagemUrl} alt="" fill className="object-cover" unoptimized />
              </div>
            )}
            <div className="p-4">
              <p className="text-sm text-foreground/80">{p.texto}</p>
              <p className="mt-3 text-[11px] font-semibold text-foreground/40">
                {p.autor.nome} · {formatarData(p.criadoEm)}
              </p>
              <form action={excluirPostagemDireta} className="mt-2">
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className="text-xs font-bold text-red-500">
                  🗑️ Excluir
                </button>
              </form>
            </div>
          </GlassCard>
        ))}
        {postagens.length === 0 && (
          <p className="text-sm text-foreground/50">Nenhuma postagem direta ainda.</p>
        )}
      </div>
    </div>
  );
}
