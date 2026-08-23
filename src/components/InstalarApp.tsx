"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function estaEmModoStandalone() {
  if (typeof window === "undefined") return false;
  const navegadorIOS = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navegadorIOS.standalone === true;
}

function ehIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

// Chrome/Edge/Android só disparam o "beforeinstallprompt" depois de um
// tempo de uso — por isso o botão nativo às vezes "não aparece". No iOS a
// Apple nem tem esse evento (só dá pra instalar via Compartilhar → Adicionar
// à Tela de Início). Este componente cobre os três casos manualmente.
export function InstalarApp() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [mostrarInstrucoesIOS, setMostrarInstrucoesIOS] = useState(false);
  const [instalado, setInstalado] = useState(true);
  const [escondido, setEscondido] = useState(false);

  useEffect(() => {
    setInstalado(estaEmModoStandalone());
    if (sessionStorage.getItem("imla:instalarDispensado") === "true") setEscondido(true);

    function aoTerPrompt(e: Event) {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", aoTerPrompt);

    if (ehIOS() && !estaEmModoStandalone()) {
      setMostrarInstrucoesIOS(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", aoTerPrompt);
  }, []);

  if (instalado || escondido || (!promptEvent && !mostrarInstrucoesIOS)) return null;

  function dispensar() {
    sessionStorage.setItem("imla:instalarDispensado", "true");
    setEscondido(true);
  }

  async function instalar() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") setEscondido(true);
    setPromptEvent(null);
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md sm:inset-x-auto sm:right-6">
      <div className="glass-strong flex items-center gap-3 rounded-2xl p-4 shadow-xl">
        <span className="text-2xl">📲</span>
        <div className="flex-1">
          <p className="text-sm font-extrabold">Instale o app do instituto</p>
          {mostrarInstrucoesIOS ? (
            <p className="mt-0.5 text-xs text-foreground/60">
              Toque em <b>Compartilhar</b> (o quadrado com a seta ↑) e depois em{" "}
              <b>&quot;Adicionar à Tela de Início&quot;</b>.
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-foreground/60">
              Acesso rápido direto da tela inicial do seu celular.
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          {!mostrarInstrucoesIOS && (
            <button
              onClick={instalar}
              className="rounded-full bg-imla-accent px-3 py-1.5 text-xs font-bold text-white shadow"
            >
              Instalar
            </button>
          )}
          <button
            onClick={dispensar}
            className="rounded-full px-3 py-1.5 text-xs font-bold text-foreground/50 hover:bg-black/5 dark:hover:bg-white/10"
          >
            {mostrarInstrucoesIOS ? "Entendi" : "Agora não"}
          </button>
        </div>
      </div>
    </div>
  );
}
