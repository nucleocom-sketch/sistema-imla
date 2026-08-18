"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import type { NucleoKey } from "@/lib/config";

type Props = {
  nome: string;
  papel: "ADMIN" | "NUCLEO" | "PADRINHO" | "VISITANTE";
  nucleo: NucleoKey | null;
  children: React.ReactNode;
};

const ROTAS_VERDES = ["/painel/pedagogico", "/painel/apadrinhamento"];

export function PainelShell({ nome, papel, nucleo, children }: Props) {
  const pathname = usePathname();
  const ehVerde = ROTAS_VERDES.some((r) => pathname.startsWith(r));

  const accentStyle = ehVerde
    ? ({ "--imla-accent": "var(--imla-green)", "--imla-accent-dark": "var(--imla-green-dark)" } as React.CSSProperties)
    : undefined;

  return (
    <div className="flex min-h-dvh flex-col pb-10" style={accentStyle}>
      <Navbar nome={nome} papel={papel} nucleo={nucleo} />
      <main className="mx-3 mt-6 flex-1 sm:mx-6">{children}</main>
    </div>
  );
}
