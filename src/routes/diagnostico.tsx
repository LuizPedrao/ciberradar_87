import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { PublicLayout } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QUESTIONS, ANSWER_LABEL, encodeAnswers, type Answer } from "@/lib/scoring";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/diagnostico")({
  head: () => ({
    meta: [
      { title: "Diagnóstico gratuito de segurança digital — CiberRadar PME" },
      { name: "description", content: "Responda 10 perguntas sobre as práticas de segurança da sua empresa e veja o resultado na hora." },
      { property: "og:title", content: "Diagnóstico gratuito — CiberRadar PME" },
      { property: "og:description", content: "Dez perguntas, resultado imediato e recomendações práticas." },
    ],
  }),
  component: Diagnostico,
});

const OPTIONS: Answer[] = ["sim", "nao", "nao_sei"];

function Diagnostico() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(Answer | undefined)[]>(Array(QUESTIONS.length).fill(undefined));
  const [error, setError] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const q = QUESTIONS[step]!;
  const current = answers[step];
  const answered = answers.filter(Boolean).length;
  const isLast = step === QUESTIONS.length - 1;

  function choose(a: Answer) {
    const next = [...answers];
    next[step] = a;
    setAnswers(next);
    setError(false);
  }

  function advance() {
    if (!current) return setError(true);
    if (!isLast) return setStep(step + 1);
    const firstMissing = answers.findIndex((a) => !a);
    if (firstMissing >= 0) { setStep(firstMissing); return setError(true); }
    setFinishing(true);
    navigate({ to: "/resultado", search: { r: encodeAnswers(answers as Answer[]) } });
  }

  return (
    <PublicLayout>
      <section className="bg-hero">
        <div className="mx-auto max-w-2xl px-4 py-12 md:py-20">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Pergunta {step + 1} de {QUESTIONS.length}</span>
            <span>{answered} respondida{answered === 1 ? "" : "s"}</span>
          </div>
          <Progress value={(answered / QUESTIONS.length) * 100} className="mt-3 h-2" aria-label="Progresso do diagnóstico" />

          <div key={q.id} className="mt-8 animate-fade-up rounded-2xl border border-border bg-card p-6 md:p-8">
            <span className="text-xs font-medium uppercase tracking-wider text-brand">{q.topic}</span>
            <h1 id="q-title" className="mt-2 font-display text-2xl font-bold">{q.text}</h1>
            <div role="radiogroup" aria-labelledby="q-title" className="mt-6 grid gap-3">
              {OPTIONS.map((o) => {
                const selected = current === o;
                return (
                  <button
                    key={o}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => choose(o)}
                    onKeyDown={(e) => { if (e.key === "Enter" && selected) advance(); }}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-5 py-4 text-left transition-all",
                      selected ? "border-brand bg-brand/10" : "border-border hover:border-brand/40 hover:bg-foreground/5",
                    )}
                  >
                    <span className="font-medium">{ANSWER_LABEL[o]}</span>
                    <span className={cn("grid h-5 w-5 place-items-center rounded-full border", selected ? "border-brand bg-brand text-brand-foreground" : "border-input")}>
                      {selected && <Check className="h-3 w-3" />}
                    </span>
                  </button>
                );
              })}
            </div>
            {error && <p role="alert" className="mt-4 text-sm text-destructive">Selecione uma resposta para continuar.</p>}
          </div>

          <div className="mt-6 flex justify-between gap-3">
            <Button variant="glass" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
              <ArrowLeft /> Voltar
            </Button>
            <Button variant="hero" onClick={advance} disabled={finishing}>
              {finishing ? <Loader2 className="animate-spin" /> : null}
              {isLast ? "Ver resultado" : "Avançar"} {!finishing && <ArrowRight />}
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
