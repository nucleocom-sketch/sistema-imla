export function AnexosField({ name = "anexos" }: { name?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-foreground/70">📎 Anexar arquivos ou fotos (opcional)</label>
      <input
        type="file"
        name={name}
        multiple
        className="w-full rounded-xl border border-foreground/10 bg-white/70 px-4 py-2.5 text-xs outline-none ring-imla-accent/40 file:mr-3 file:rounded-full file:border-0 file:bg-imla-accent file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white focus:ring-2 dark:bg-white/5"
      />
    </div>
  );
}

export function ListaAnexos({ anexos }: { anexos: string[] }) {
  if (anexos.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {anexos.map((url, i) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-imla-accent/10 px-3 py-1 text-[11px] font-bold text-imla-accent-dark hover:bg-imla-accent/20"
        >
          📎 Anexo {i + 1}
        </a>
      ))}
    </div>
  );
}
