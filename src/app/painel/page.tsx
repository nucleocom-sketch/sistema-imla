import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/auth";

export default async function PainelHome() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/");

  if (sessao.papel === "PADRINHO") redirect("/painel/apadrinhamento");
  redirect("/painel/intranet");
}
