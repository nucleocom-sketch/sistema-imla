import { prisma } from "@/lib/db";
import { GlassCard } from "@/components/ui/GlassCard";
import { SALAS, NIVEIS_ALFABETIZACAO, type SalaKey, type NivelAlfabetizacaoKey } from "@/lib/config";

export default async function IndicadoresPage() {
  try {
    const alunos = await prisma.aluno.findMany({
      include: { matriculaTurnoEstendido: true, avaliacoesAlfabetizacao: true },
    });

    const totalAlunos = alunos.length;
    const apadrinhados = alunos.filter((a) => a.padrinho).length;
    const noTurnoEstendido = alunos.filter((a) => a.matriculaTurnoEstendido).length;

    const porSala: Record<SalaKey, number> = {
      ROSA: 0,
      AMARELA: 0,
      VERDE: 0,
      AZUL: 0,
      CIRANDA_MUNDO: 0,
    };
    for (const a of alunos) porSala[a.sala as SalaKey] += 1;

    const porNivel: Record<NivelAlfabetizacaoKey, number> = Object.fromEntries(
      NIVEIS_ALFABETIZACAO.map((n) => [n.key, 0])
    ) as Record<NivelAlfabetizacaoKey, number>;

    for (const a of alunos) {
      const ultima = a.avaliacoesAlfabetizacao.at(-1);
      if (ultima) porNivel[ultima.nivel as NivelAlfabetizacaoKey] += 1;
    }

    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Metrica label="Total de alunos" valor={totalAlunos} />
          <Metrica label="Apadrinhados" valor={apadrinhados} />
          <Metrica label="Turno Estendido" valor={noTurnoEstendido} />
        </div>

        <GlassCard className="p-5">
          <p className="mb-4 font-extrabold">Alunos por sala</p>
          <div className="flex flex-col gap-3">
            {Object.entries(SALAS).map(([key, s]) => (
              <BarraProgresso
                key={key}
                label={`${s.icon} ${s.label}`}
                valor={porSala[key as SalaKey]}
                total={totalAlunos || 1}
                cor={s.cor}
              />
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="mb-4 font-extrabold">Diagnóstico de alfabetização (última avaliação)</p>
          <div className="flex flex-col gap-3">
            {NIVEIS_ALFABETIZACAO.map((n) => (
              <BarraProgresso
                key={n.key}
                label={n.label}
                valor={porNivel[n.key]}
                total={noTurnoEstendido || 1}
                cor={n.cor}
              />
            ))}
          </div>
        </GlassCard>
      </div>
    );
  } catch {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-lg font-extrabold">🔌 Banco de dados ainda não conectado</p>
        <p className="mt-2 text-sm text-foreground/60">
          Assim que a connection string do Postgres for configurada, esta tela vai
          mostrar os indicadores pedagógicos gerais do instituto.
        </p>
      </GlassCard>
    );
  }
}

function Metrica({ label, valor }: { label: string; valor: number }) {
  return (
    <GlassCard className="p-5 text-center">
      <p className="text-3xl font-black text-imla-accent-dark">{valor}</p>
      <p className="mt-1 text-xs font-bold text-foreground/60">{label}</p>
    </GlassCard>
  );
}

function BarraProgresso({
  label,
  valor,
  total,
  cor,
}: {
  label: string;
  valor: number;
  total: number;
  cor: string;
}) {
  const pct = Math.round((valor / total) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-bold">
        <span>{label}</span>
        <span>{valor}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cor }} />
      </div>
    </div>
  );
}
