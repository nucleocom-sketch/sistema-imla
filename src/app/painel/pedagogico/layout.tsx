import { redirect } from "next/navigation";
import Link from "next/link";
import { obterSessao } from "@/lib/auth";

const ABAS = [
  { href: "/painel/pedagogico/matriculas", label: "📝 Matrículas" },
  { href: "/painel/pedagogico/tabua-da-mare", label: "🌊 Tábua da Maré" },
  { href: "/painel/pedagogico/turno-estendido", label: "📖 Turno Estendido" },
  { href: "/painel/pedagogico/indicadores", label: "📈 Indicadores" },
];

export default async function PedagogicoLayout({ children }: LayoutProps<"/painel/pedagogico">) {
  const sessao = await obterSessao();
  if (!sessao) redirect("/");
  if (sessao.papel !== "ADMIN") redirect("/painel");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black">📚 Pedagógico</h1>
        <p className="text-sm text-foreground/60">
          Matrícula, apadrinhamento e acompanhamento pedagógico das crianças.
        </p>
      </div>

      <div className="flex flex-wrap gap-1 rounded-2xl bg-black/5 p-1 dark:bg-white/5">
        {ABAS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="rounded-full px-4 py-2 text-sm font-bold text-foreground/70 transition hover:bg-white/70 dark:hover:bg-white/10"
          >
            {a.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}
