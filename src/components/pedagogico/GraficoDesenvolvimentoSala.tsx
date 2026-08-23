"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Ponto = { semestre: string; percentual: number };

export function GraficoDesenvolvimentoSala({ dados, cor }: { dados: Ponto[]; cor: string }) {
  if (dados.length < 2) {
    return (
      <p className="flex h-48 items-center justify-center text-xs text-foreground/40">
        Ainda não há avaliações suficientes para formar uma curva (é preciso pelo menos 2 semestres registrados).
      </p>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dados} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis dataKey="semestre" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value) => [`${Math.round(Number(value))}%`, "Desenvolvimento médio"]}
            contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="percentual"
            stroke={cor}
            strokeWidth={3}
            dot={{ r: 4, fill: cor }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
