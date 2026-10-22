// Regras centrais do diagnóstico CiberRadar PME.
// Usado no navegador (resultado imediato) e no servidor (recalculo antes de salvar leads).

export type Answer = "sim" | "nao" | "nao_sei";

export const ANSWER_LABEL: Record<Answer, string> = {
  sim: "Sim",
  nao: "Não",
  nao_sei: "Não sei",
};

export const ANSWER_POINTS: Record<Answer, number> = { sim: 10, nao_sei: 3, nao: 0 };

export interface Question {
  id: string;
  text: string;
  topic: string;
  positive: string;
  recommendation: string;
}

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    topic: "Autenticação multifator",
    text: "Sua empresa utiliza autenticação multifator nos principais sistemas?",
    positive: "A autenticação multifator já protege os principais acessos.",
    recommendation:
      "Priorize a ativação de autenticação multifator nos sistemas que oferecem esse recurso.",
  },
  {
    id: "q2",
    topic: "Proteção de dispositivos",
    text: "Os computadores possuem proteção de endpoint ou antivírus atualizado?",
    positive: "Os computadores contam com proteção de endpoint atualizada.",
    recommendation:
      "Garanta que todos os computadores tenham proteção de endpoint ou antivírus ativo e atualizado.",
  },
  {
    id: "q3",
    topic: "Backup",
    text: "Existem backups regulares dos dados importantes?",
    positive: "Há rotina de backup dos dados importantes.",
    recommendation:
      "Estabeleça uma rotina de backup com cópias protegidas e verificações periódicas.",
  },
  {
    id: "q4",
    topic: "Recuperação de backup",
    text: "A empresa já testou a recuperação de algum backup?",
    positive: "A recuperação de backups já foi testada.",
    recommendation:
      "Programe testes periódicos de restauração para confirmar que os backups realmente funcionam.",
  },
  {
    id: "q5",
    topic: "Contas individuais",
    text: "Cada colaborador possui uma conta individual para acessar os sistemas?",
    positive: "Cada colaborador usa sua própria conta de acesso.",
    recommendation:
      "Evite contas compartilhadas: crie um acesso individual para cada colaborador.",
  },
  {
    id: "q6",
    topic: "Revisão de permissões",
    text: "As permissões de acesso são revisadas periodicamente?",
    positive: "As permissões de acesso são revisadas com frequência.",
    recommendation:
      "Revise periodicamente quem tem acesso a cada sistema e remova permissões desnecessárias.",
  },
  {
    id: "q7",
    topic: "Atualizações",
    text: "Os sistemas e computadores recebem atualizações de segurança?",
    positive: "Sistemas e computadores recebem atualizações de segurança.",
    recommendation:
      "Ative atualizações automáticas e acompanhe a instalação de correções de segurança.",
  },
  {
    id: "q8",
    topic: "Conscientização",
    text: "Os funcionários recebem orientações sobre phishing e golpes digitais?",
    positive: "A equipe recebe orientações sobre phishing e golpes.",
    recommendation: "Promova orientações básicas sobre phishing e engenharia social.",
  },
  {
    id: "q9",
    topic: "Resposta a incidentes",
    text: "Existe um procedimento para comunicar incidentes de segurança?",
    positive: "Existe um caminho definido para comunicar incidentes.",
    recommendation:
      "Defina um procedimento simples para que qualquer pessoa saiba como e a quem comunicar um incidente.",
  },
  {
    id: "q10",
    topic: "Política de segurança",
    text: "A empresa possui alguma política ou orientação formal sobre segurança da informação?",
    positive: "Há orientação formal sobre segurança da informação.",
    recommendation:
      "Documente regras básicas de segurança da informação e compartilhe com toda a equipe.",
  },
];

export const UNKNOWN_RECOMMENDATION =
  "Verifique com o responsável pela tecnologia se esta prática já está implementada.";

export type Classification =
  | "Alta necessidade de atenção"
  | "Proteção em desenvolvimento"
  | "Boas práticas iniciais";

export function classify(score: number): Classification {
  if (score >= 70) return "Boas práticas iniciais";
  if (score >= 40) return "Proteção em desenvolvimento";
  return "Alta necessidade de atenção";
}

export function isAnswer(v: unknown): v is Answer {
  return v === "sim" || v === "nao" || v === "nao_sei";
}

/** Retorna as respostas na ordem das perguntas, ou null se incompletas/inválidas. */
export function normalizeAnswers(input: Record<string, unknown>): Answer[] | null {
  const out: Answer[] = [];
  for (const q of QUESTIONS) {
    const v = input[q.id];
    if (!isAnswer(v)) return null;
    out.push(v);
  }
  return out;
}

export function computeScore(answers: Answer[]): number {
  if (answers.length !== QUESTIONS.length) throw new Error("Respostas incompletas");
  return answers.reduce((sum, a) => sum + ANSWER_POINTS[a], 0);
}

export interface ResultItem {
  topic: string;
  text: string;
}

export interface DiagnosticResult {
  score: number;
  classification: Classification;
  summary: string;
  positives: ResultItem[];
  attention: ResultItem[];
  recommendations: ResultItem[];
}

const SUMMARY: Record<Classification, string> = {
  "Alta necessidade de atenção":
    "Várias práticas essenciais de segurança ainda não estão presentes ou não foram confirmadas. Começar pelas recomendações abaixo pode reduzir bastante a exposição da empresa.",
  "Proteção em desenvolvimento":
    "A empresa já adota algumas boas práticas, mas ainda há pontos importantes a fortalecer para tornar a proteção mais consistente.",
  "Boas práticas iniciais":
    "A empresa demonstra boas práticas iniciais de segurança. Manter a rotina e revisar os pontos restantes ajuda a sustentar esse nível.",
};

export function buildResult(answers: Answer[]): DiagnosticResult {
  const score = computeScore(answers);
  const classification = classify(score);
  const positives: ResultItem[] = [];
  const attention: ResultItem[] = [];
  const recommendations: ResultItem[] = [];
  QUESTIONS.forEach((q, i) => {
    const a = answers[i];
    if (a === "sim") positives.push({ topic: q.topic, text: q.positive });
    else {
      attention.push({ topic: q.topic, text: q.text });
      recommendations.push({
        topic: q.topic,
        text: a === "nao" ? q.recommendation : UNKNOWN_RECOMMENDATION,
      });
    }
  });
  return { score, classification, summary: SUMMARY[classification], positives, attention, recommendations };
}

// Codificação compacta das respostas para a URL do resultado: s / n / x por pergunta.
const CODE: Record<Answer, string> = { sim: "s", nao: "n", nao_sei: "x" };
const DECODE: Record<string, Answer> = { s: "sim", n: "nao", x: "nao_sei" };

export function encodeAnswers(answers: Answer[]): string {
  return answers.map((a) => CODE[a]).join("");
}

export function decodeAnswers(code: string | undefined): Answer[] | null {
  if (!code || code.length !== QUESTIONS.length) return null;
  const out: Answer[] = [];
  for (const ch of code) {
    const a = DECODE[ch];
    if (!a) return null;
    out.push(a);
  }
  return out;
}

export function answersToRecord(answers: Answer[]): Record<string, Answer> {
  return Object.fromEntries(QUESTIONS.map((q, i) => [q.id, answers[i]]));
}
