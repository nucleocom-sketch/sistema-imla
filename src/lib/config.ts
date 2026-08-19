export const NUCLEOS = {
  ADMINISTRATIVO_FINANCEIRO: { label: "Administrativo e Financeiro", icon: "💰" },
  PROJETOS_CAPTACAO: { label: "Projetos e Captação de Recursos", icon: "🤝" },
  JURIDICO_SOCIAL: { label: "Jurídico Social", icon: "⚖️" },
  TECNOLOGIA_COMUNICACAO: { label: "Tecnologia e Comunicação", icon: "💻" },
  ESPORTE_LAZER: { label: "Esporte e Lazer", icon: "⚽" },
  PEDAGOGICO: { label: "Pedagógico", icon: "📚" },
  SAUDE_MEIO_AMBIENTE: { label: "Saúde e Meio Ambiente", icon: "🌱" },
  APOIO_INFRAESTRUTURA: { label: "Apoio e Infraestrutura", icon: "🛠️" },
} as const;

export type NucleoKey = keyof typeof NUCLEOS;

export const SALAS = {
  ROSA: { label: "Sala Rosa", cor: "#ff81ba", icon: "🌸" },
  AMARELA: { label: "Sala Amarela", cor: "#ffc713", icon: "⭐" },
  VERDE: { label: "Sala Verde", cor: "#a8cf45", icon: "🌿" },
  AZUL: { label: "Sala Azul", cor: "#4fc3d1", icon: "💧" },
  CIRANDA_MUNDO: { label: "Cirandas do Mundo", cor: "#6741d9", icon: "🌍" },
} as const;

export type SalaKey = keyof typeof SALAS;

export const NIVEIS_ALFABETIZACAO = [
  { key: "PRE_SILABICO", label: "Pré-Silábico", cor: "#FADBD8" },
  { key: "SILABICO_SEM_VALOR", label: "Silábico s/ Valor", cor: "#FDEBD0" },
  { key: "SILABICO_COM_VALOR", label: "Silábico c/ Valor", cor: "#FCF3CF" },
  { key: "SILABICO_ALFABETICO", label: "Silábico Alfabético", cor: "#D5F5E3" },
  { key: "ALFABETICO_INICIAL", label: "Alfabético Inicial", cor: "#A9DFBF" },
  { key: "ALFABETICO_FINAL", label: "Alfabético Final", cor: "#D6EAF8" },
  { key: "ALFABETICO_ORTOGRAFICO", label: "Alfabético Ortográfico", cor: "#EBDEF0" },
] as const;

export type NivelAlfabetizacaoKey = (typeof NIVEIS_ALFABETIZACAO)[number]["key"];

export const EVIDENCIAS_POR_NIVEL: Record<NivelAlfabetizacaoKey, string[]> = {
  PRE_SILABICO: [
    "Diferencia letras de desenhos",
    "Escreve o nome sem apoio",
    "Acredita que nomes grandes têm muitas letras",
    "Sabe que se escreve da esquerda para a direita",
  ],
  SILABICO_SEM_VALOR: [
    "Uma letra para cada sílaba (sem som)",
    "Segmenta a fala em partes",
    "Respeita quantidade de emissões sonoras",
    "Faz leitura global da palavra",
  ],
  SILABICO_COM_VALOR: [
    "Usa vogais correspondentes ao som",
    "Identifica o som inicial das palavras",
    "Leitura apontada (acompanha com o dedo)",
    "Escreve uma letra por sílaba com som correto",
  ],
  SILABICO_ALFABETICO: [
    "Oscila entre uma letra e a sílaba completa",
    "Começa a usar consoantes nas sílabas",
    "Consegue completar lacunas de letras",
    "Percebe a estrutura da sílaba simples",
  ],
  ALFABETICO_INICIAL: [
    "Compreende o sistema de escrita",
    "Erros ortográficos comuns (ex: K por C)",
    "Lê textos curtos com fluidez",
    "Segmentação de palavras irregular",
  ],
  ALFABETICO_FINAL: [
    "Diferencia sons semelhantes (P/B, T/D)",
    "Usa corretamente dígrafos (LH, NH, CH)",
    "Domina regras básicas de pontuação",
    "Produz textos com coesão",
  ],
  ALFABETICO_ORTOGRAFICO: [
    "Escrita autônoma e correta",
    "Domina acentuação e regras complexas",
    "Lê com entonação e fluidez total",
    "Revisa o próprio texto",
  ],
};

export const CATEGORIAS_MARE = [
  "Atividades em grupo/Proatividade",
  "Interesse pelo novo",
  "Compartilhamento de Materiais",
  "Clareza e desenvoltura",
  "Respeito às regras",
  "Vocabulário adequado",
  "Leitura e Escrita",
  "Compreensão de comandos",
  "Superação de desafios",
  "Assiduidade",
] as const;

export const NIVEIS_MARE = [
  { key: "BAIXA", label: "Maré Baixa" },
  { key: "VAZANTE", label: "Maré Vazante" },
  { key: "ENCHENTE", label: "Maré Enchente" },
  { key: "ALTA", label: "Maré Alta" },
  { key: "CHEIA", label: "Maré Cheia" },
] as const;

export const PRIORIDADES = {
  BAIXA: { label: "Baixa", cor: "#34c759" },
  MEDIA: { label: "Média", cor: "#ff9f0a" },
  ALTA: { label: "Alta", cor: "#ff3b30" },
} as const;

export const STATUS_TAREFA = {
  CRIADA: { label: "Criada", cor: "#8e8e93" },
  EM_ANDAMENTO: { label: "Em andamento", cor: "#4fc3d1" },
  CONCLUIDA: { label: "Concluída", cor: "#34c759" },
} as const;
