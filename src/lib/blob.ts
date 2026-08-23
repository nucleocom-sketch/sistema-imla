import { put } from "@vercel/blob";

const TAMANHO_MAXIMO = 15 * 1024 * 1024; // 15MB

// Upload genérico usado pelos anexos de Demandas e da Próxima Ciranda.
// Retorna null quando não há arquivo (campo opcional) e lança erro se
// passar do tamanho máximo, para o formulário exibir uma mensagem clara.
export async function enviarAnexo(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > TAMANHO_MAXIMO) {
    throw new Error("O arquivo é grande demais (máximo 15MB).");
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Upload de arquivos ainda não configurado — fale com o suporte técnico.");
  }

  const nomeUnico = `${Date.now()}-${file.name}`;
  const blob = await put(nomeUnico, file, { access: "public", addRandomSuffix: true });
  return blob.url;
}

export async function enviarAnexos(formData: FormData, campo: string): Promise<string[]> {
  const arquivos = formData.getAll(campo).filter((f): f is File => f instanceof File && f.size > 0);
  const urls = await Promise.all(arquivos.map((f) => enviarAnexo(f)));
  return urls.filter((u): u is string => !!u);
}
