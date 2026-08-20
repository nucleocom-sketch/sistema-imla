"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

export type SelectOption = { value: string; label: string };

type SelectProps = {
  name?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
};

// Dropdown com a mesma cara "liquid glass" do resto do site — o <select>
// nativo do navegador não dá pra estilizar (a lista some com o fundo branco
// padrão do sistema operacional). Emite um <input type="hidden"> por baixo
// para continuar funcionando dentro de <form action={...}>.
export function Select({
  name,
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "Selecione...",
  searchable = false,
  className = "",
}: SelectProps) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [internoValue, setInternoValue] = useState(defaultValue ?? "");
  const wrapRef = useRef<HTMLDivElement>(null);

  const selecionado = value !== undefined ? value : internoValue;
  const opcaoAtual = options.find((o) => o.value === selecionado);

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setAberto(false);
        setBusca("");
      }
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, []);

  const filtradas = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(busca.toLowerCase()))
    : options;

  function escolher(v: string) {
    if (value === undefined) setInternoValue(v);
    onChange?.(v);
    setAberto(false);
    setBusca("");
  }

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={selecionado} />}
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-left text-sm outline-none ring-imla-accent/40 transition focus:ring-2 dark:bg-white/5"
      >
        <span className={opcaoAtual ? "" : "text-foreground/40"}>
          {opcaoAtual ? opcaoAtual.label : placeholder}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-foreground/40 transition-transform ${aberto ? "rotate-180" : ""}`} />
      </button>

      {aberto && (
        <div className="glass-strong absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-72 overflow-hidden rounded-2xl p-2 shadow-xl">
          {searchable && (
            <div className="relative mb-2">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input
                autoFocus
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar..."
                className="w-full rounded-lg border border-foreground/10 bg-white/80 py-2 pl-9 pr-3 text-sm outline-none dark:bg-white/10"
              />
            </div>
          )}
          <div className="max-h-56 overflow-y-auto">
            {filtradas.length === 0 && (
              <p className="px-3 py-2 text-xs text-foreground/40">Nada encontrado.</p>
            )}
            {filtradas.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => escolher(o.value)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  o.value === selecionado
                    ? "bg-imla-accent font-bold text-white"
                    : "hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
