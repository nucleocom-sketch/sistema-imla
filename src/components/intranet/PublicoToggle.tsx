"use client";

import { useState, useEffect } from "react";

export function PublicoToggle({
  aviso,
  onDisabledChange,
}: {
  aviso: string;
  onDisabledChange: (desabilitado: boolean) => void;
}) {
  const [ehPublico, setEhPublico] = useState(false);
  const [confirmou, setConfirmou] = useState(false);

  useEffect(() => {
    onDisabledChange(ehPublico && !confirmou);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ehPublico, confirmou]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4 text-sm font-semibold">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="publica"
            value="false"
            checked={!ehPublico}
            onChange={() => {
              setEhPublico(false);
              setConfirmou(false);
            }}
          />
          🔒 Privado (só o núcleo)
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="publica"
            value="true"
            checked={ehPublico}
            onChange={() => {
              setEhPublico(true);
              setConfirmou(false);
            }}
          />
          🌐 Público (todos veem)
        </label>
      </div>

      {ehPublico && (
        <div className="rounded-xl border border-imla-yellow/50 bg-imla-yellow/10 p-3">
          <p className="text-xs font-bold text-foreground/80">⚠️ {aviso}</p>
          <label className="mt-2 flex items-center gap-2 text-xs font-bold">
            <input
              type="checkbox"
              checked={confirmou}
              onChange={(e) => setConfirmou(e.target.checked)}
            />
            Confirmo que quero tornar isso público
          </label>
        </div>
      )}

      <input type="hidden" name="confirmouPublico" value={confirmou ? "true" : "false"} />
    </div>
  );
}
