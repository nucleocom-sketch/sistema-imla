import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/auth";
import { PainelShell } from "@/components/layout/PainelShell";

export default async function PainelLayout({ children }: LayoutProps<"/painel">) {
  const sessao = await obterSessao();
  if (!sessao) {
    redirect("/");
  }

  return (
    <PainelShell nome={sessao.nome} papel={sessao.papel} nucleo={sessao.nucleo}>
      {children}
    </PainelShell>
  );
}
