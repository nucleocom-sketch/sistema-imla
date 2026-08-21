import type { ReactNode } from "react";

// Renderiza o texto de uma postagem como ele realmente aparece — em
// parágrafos, com **negrito** e links (https://...) clicáveis — em vez de
// mostrar os asteriscos e tudo em um bloco só, como ficava antes.
// Ordem importa: link em formato [texto](url) precisa ser testado antes do
// link "solto", senão a URL de dentro dos parênteses casa primeiro e sobra
// "[texto](" e ")" como texto literal ao redor do link.
const REGEX_PARTE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*(.+?)\*\*|(https?:\/\/[^\s)]+)/g;

function renderizarLinha(linha: string, chaveBase: string) {
  const partes: ReactNode[] = [];
  let ultimoIndice = 0;
  let contador = 0;

  for (const match of linha.matchAll(REGEX_PARTE)) {
    const [textoCompleto, rotuloLink, urlDoLink, negrito, linkSolto] = match;
    const indice = match.index ?? 0;

    if (indice > ultimoIndice) {
      partes.push(linha.slice(ultimoIndice, indice));
    }

    const link = urlDoLink ?? linkSolto;
    if (rotuloLink !== undefined && urlDoLink !== undefined) {
      partes.push(
        <a
          key={`${chaveBase}-${contador++}`}
          href={urlDoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-imla-accent-dark underline underline-offset-2"
        >
          {rotuloLink}
        </a>
      );
    } else if (negrito !== undefined) {
      partes.push(<strong key={`${chaveBase}-${contador++}`}>{negrito}</strong>);
    } else if (link !== undefined) {
      partes.push(
        <a
          key={`${chaveBase}-${contador++}`}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-imla-accent-dark underline underline-offset-2"
        >
          {link}
        </a>
      );
    }

    ultimoIndice = indice + textoCompleto.length;
  }

  if (ultimoIndice < linha.length) {
    partes.push(linha.slice(ultimoIndice));
  }

  return partes;
}

export function TextoFormatado({ texto, className = "" }: { texto: string; className?: string }) {
  const paragrafos = texto.split(/\n+/).filter((l) => l.trim().length > 0);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {paragrafos.map((linha, i) => (
        <p key={i}>{renderizarLinha(linha, `p${i}`)}</p>
      ))}
    </div>
  );
}
