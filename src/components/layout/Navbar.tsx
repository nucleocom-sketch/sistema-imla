"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NUCLEOS, type NucleoKey } from "@/lib/config";
import { sair } from "@/app/(auth)/actions";
import type { Papel } from "@prisma/client";

type NavbarProps = {
  nome: string;
  papel: Papel;
  nucleo: NucleoKey | null;
};

const LINKS_ADMIN = [
  { href: "/painel/intranet", label: "Portal Institucional" },
  { href: "/painel/pedagogico", label: "Pedagógico" },
  { href: "/painel/apadrinhamento", label: "Apadrinhamento" },
  { href: "/painel/portal-direto", label: "📸 Rede Social" },
];

const LINKS_NUCLEO = [{ href: "/painel/intranet", label: "Portal Institucional" }];

const LINKS_PADRINHO = [{ href: "/painel/apadrinhamento", label: "Meu afilhado" }];

export function Navbar({ nome, papel, nucleo }: NavbarProps) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  const links = papel === "ADMIN" ? LINKS_ADMIN : papel === "NUCLEO" ? LINKS_NUCLEO : LINKS_PADRINHO;

  const iniciais = nome
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

  return (
    <header className="sticky top-3 z-50 mx-3 sm:mx-6">
      <nav className="glass-strong flex items-center justify-between gap-4 rounded-full px-4 py-2.5 sm:px-6">
        <Link href="/painel" className="flex shrink-0 items-center gap-2">
          <Image src="/images/logo.png" alt="Instituto Mãe Lalu" width={140} height={44} className="h-8 w-auto sm:h-9" />
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {links.map((link) => {
            const ativo = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  ativo
                    ? "bg-imla-accent text-white shadow"
                    : "text-foreground/70 hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setAberto((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-imla-purple text-xs font-black text-white shadow"
          >
            {iniciais}
          </button>

          {aberto && (
            <div className="glass-strong absolute right-0 top-12 w-60 rounded-2xl p-4">
              <p className="text-sm font-extrabold">{nome}</p>
              <p className="mt-0.5 text-xs font-semibold text-foreground/60">
                {papel === "ADMIN" && "Coordenação"}
                {papel === "NUCLEO" && nucleo && `${NUCLEOS[nucleo].icon} ${NUCLEOS[nucleo].label}`}
                {papel === "PADRINHO" && "Padrinho/Madrinha"}
              </p>

              <div className="mt-3 flex md:hidden flex-col gap-1 border-t border-foreground/10 pt-3">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setAberto(false)}
                    className="rounded-lg px-2 py-1.5 text-sm font-bold text-foreground/70 hover:bg-black/5"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <form action={sair} className="mt-3 border-t border-foreground/10 pt-3">
                <button
                  type="submit"
                  className="w-full rounded-full bg-red-500/10 px-4 py-2 text-xs font-extrabold text-red-500 transition hover:bg-red-500/20"
                >
                  Sair
                </button>
              </form>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
