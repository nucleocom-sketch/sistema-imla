"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { inscreverPush } from "@/app/push-actions";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function NotificacoesRedeSocial() {
  const [suportado, setSuportado] = useState(false);
  const [status, setStatus] = useState<NotificationPermission | "carregando">("carregando");
  const [enviando, setEnviando] = useState(false);
  const [escondido, setEscondido] = useState(false);

  useEffect(() => {
    const ok =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window &&
      !!VAPID_PUBLIC_KEY;
    setSuportado(ok);
    if (ok) setStatus(Notification.permission);
  }, []);

  if (!suportado || status === "granted" || status === "denied" || escondido) return null;

  async function ativar() {
    setEnviando(true);
    try {
      const permissao = await Notification.requestPermission();
      setStatus(permissao);
      if (permissao !== "granted") return;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
      });

      await inscreverPush(subscription.toJSON());
    } catch {
      // silencioso — a pessoa pode tentar de novo depois
    } finally {
      setEnviando(false);
    }
  }

  return (
    <GlassCard className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔔</span>
        <div>
          <p className="text-sm font-extrabold">Quer ser avisado de novidades?</p>
          <p className="text-xs text-foreground/60">
            Receba uma notificação sempre que sair algo novo na Rede Social.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setEscondido(true)}
          className="rounded-full px-3 py-2 text-xs font-bold text-foreground/50 hover:bg-black/5 dark:hover:bg-white/10"
        >
          Agora não
        </button>
        <Button onClick={ativar} disabled={enviando} className="text-xs">
          {enviando ? "Ativando..." : "🔔 Ativar notificações"}
        </Button>
      </div>
    </GlassCard>
  );
}
