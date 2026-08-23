import { prisma } from "@/lib/db";
import { GlassCard } from "@/components/ui/GlassCard";
import { GraficoDesenvolvimentoSala } from "@/components/pedagogico/GraficoDesenvolvimentoSala";
import { SALAS, NIVEIS_ALFABETIZACAO, NIVEIS_MARE, type SalaKey, type NivelAlfabetizacaoKey } from "@/lib/config";

const NIVEL_MARE_INDEX: Record<string, number> = Object.fromEntries(
  NIVEIS_MARE.map((n, i) => [n.key, i + 1])
);

export default async function IndicadoresPage() {
  try {
    const alunos = await prisma.aluno.findMany({
      include: { matriculaTurnoEstendido: true, avaliacoesAlfabetizacao: true, avaliacoesMare: true },
    });

    // Curva de desenvolvimento (Tábua da Maré) por sala: média de todos os
    // alunos e categorias daquele semestre, numa escala de 0-100%.
    const acumuladoPorSala: Record<SalaKey, Map<string, { soma: number; qtd: number; ordem: number }>> = {
      ROSA: new Map(),
      AMARELA: new Map(),
      VERDE: new Map(),
      AZUL: new Map(),
      CIRANDA_MUNDO: new Map(),
    };

    for (const a of alunos) {
      for (const av of a.avaliacoesMare) {
        const notas = Array.isArray(av.notas) ? (av.notas as string[]) : [];
        if (notas.length === 0) continue;
        const mediaAluno = notas.reduce((acc, n) => acc + (NIVEL_MARE_INDEX[n] ?? 1), 0) / notas.length;

        const mapa = acumuladoPorSala[a.sala as SalaKey];
        const atual = mapa.get(av.semestre) ?? { soma: 0, qtd: 0, ordem: av.criadoEm.getTime() };
        atual.soma += mediaAluno;
        atual.qtd += 1;
        atual.ordem = Math.min(atual.ordem, av.criadoEm.getTime());
        mapa.set(av.semestre, atual);
      }
    }

    const curvasPorSala: Record<SalaKey, { semestre: string; percentual: number }[]> = Object.fromEntries(
      Object.entries(acumuladoPorSala).map(([sala, mapa]) => [
        sala,
        Array.from(mapa.entries())
          .sort((a, b) => a[1].ordem - b[1].ordem)
          .map(([semestre, { soma, qtd }]) => ({ semestre, percentual: ((soma / qtd) / 5) * 100 })),
      ])
    ) as Record<SalaKey, { semestre: string; percentual: number }[]>;

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

        <div>
          <p className="mb-3 font-extrabold">🌊 Curva de desenvolvimento (Tábua da Maré) por sala</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Object.entries(SALAS).map(([key, s]) => (
              <GlassCard key={key} className="p-5">
                <p className="mb-2 text-sm font-extrabold">{s.icon} {s.label}</p>
                <GraficoDesenvolvimentoSala dados={curvasPorSala[key as SalaKey]} cor={s.cor} />
              </GlassCard>
            ))}
          </div>
        </div>

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
