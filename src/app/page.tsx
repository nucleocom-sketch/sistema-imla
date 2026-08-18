import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/auth";
import { AuthScreen } from "@/components/auth/AuthScreen";

export default async function Home() {
  const sessao = await obterSessao();
  if (sessao) {
    redirect("/painel");
  }

  return <AuthScreen />;
}
