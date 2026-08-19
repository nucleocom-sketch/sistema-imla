import Image from "next/image";
import { GlassCard } from "@/components/ui/GlassCard";

export function InstitucionalHero() {
  return (
    <GlassCard strong className="relative overflow-hidden p-0">
      <div className="relative h-64 w-full sm:h-80">
        <Image
          src="/images/banner-institucional.jpg"
          alt="Instituto Mãe Lalu"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1f24]/90 via-[#0b1f24]/40 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 flex flex-col gap-3 p-6 sm:p-8">
        <div>
          <h1 className="text-2xl font-black text-white drop-shadow sm:text-3xl">
            Instituto Mãe Lalu
          </h1>
          <p className="mt-1 max-w-lg text-sm font-medium text-white/90 drop-shadow">
            Um lugar para todos. Aqui você acompanha tudo que acontece em cada núcleo
            do instituto — fique por dentro das novidades, avisos e projetos que
            transformam a vida das nossas crianças e famílias.
          </p>
        </div>
        <button
          type="button"
          className="w-fit rounded-full bg-white/90 px-5 py-2 text-sm font-bold text-foreground transition hover:bg-white"
        >
          Saiba mais →
        </button>
      </div>
    </GlassCard>
  );
}
