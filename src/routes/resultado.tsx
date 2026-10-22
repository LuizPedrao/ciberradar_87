import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, AlertTriangle, Lightbulb, RotateCcw, MessageSquareText, Info } from "lucide-react";
import { PublicLayout } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { LeadDialog } from "@/components/site/LeadDialog";
import { ScoreRing } from "@/components/ScoreRing";
import { buildResult, decodeAnswers } from "@/lib/scoring";

export const Route = createFileRoute("/resultado")({
  validateSearch: z.object({ r: z.string().max(20).optional() }),
  head: () => ({
    meta: [
      { title: "Seu resultado — CiberRadar PME" },
      { name: "description", content: "Pontuação, pontos de atenção e recomendações do seu diagnóstico de segurança digital." },
      { property: "og:title", content: "Resultado do diagnóstico — CiberRadar PME" },
      { property: "og:description", content: "Veja pontos positivos, pontos de atenção e recomendações para sua empresa." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Resultado,
});

function Resultado() {
  const { r } = Route.useSearch();
  const answers = decodeAnswers(r);
  const [open, setOpen] = useState(false);

  if (!answers) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <h1 className="font-display text-2xl font-bold">Nenhum diagnóstico encontrado</h1>
          <p className="mt-2 text-muted-foreground">Responda às dez perguntas para ver seu resultado.</p>
          <Button asChild variant="hero" className="mt-6"><Link to="/diagnostico">Iniciar diagnóstico</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  const res = buildResult(answers);
  return (
    <PublicLayout>
      <section className="bg-hero">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-14 md:grid-cols-[auto_1fr]">
          <ScoreRing score={res.score} size={200} />
          <div>
            <span className="text-sm uppercase tracking-wider text-muted-foreground">Índice de práticas de segurança</span>
            <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{res.classification}</h1>
            <p className="mt-4 text-muted-foreground">{res.summary}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button variant="hero" size="lg" onClick={() => setOpen(true)}><MessageSquareText /> Solicitar orientação personalizada</Button>
              <Button asChild variant="glass" size="lg"><Link to="/diagnostico"><RotateCcw /> Refazer diagnóstico</Link></Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-14 md:grid-cols-2">
        <ListCard title="Pontos positivos" icon={<CheckCircle2 className="h-5 w-5 text-success" />} items={res.positives} empty="Nenhuma prática confirmada ainda — as recomendações ao lado são um bom ponto de partida." />
        <ListCard title="Pontos que precisam de atenção" icon={<AlertTriangle className="h-5 w-5 text-warning" />} items={res.attention} empty="Nenhum ponto de atenção identificado nas respostas." />
        <div className="md:col-span-2">
          <ListCard title="Recomendações" icon={<Lightbulb className="h-5 w-5 text-brand" />} items={res.recommendations} empty="Continue mantendo as boas práticas e revise-as periodicamente." numbered />
        </div>
        <div className="flex gap-3 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground md:col-span-2">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <p>Este índice é um indicador educativo, calculado a partir das suas respostas. Não é uma métrica científica de risco, certificação ou garantia de proteção, e não substitui uma auditoria ou análise técnica especializada.</p>
        </div>
      </section>
      <LeadDialog open={open} onOpenChange={setOpen} answersCode={r!} />
    </PublicLayout>
  );
}

function ListCard({ title, icon, items, empty, numbered }: { title: string; icon: React.ReactNode; items: { topic: string; text: string }[]; empty: string; numbered?: boolean }) {
  return (
    <div className="h-full rounded-2xl border border-border bg-card p-6">
      <h2 className="flex items-center gap-2 font-semibold">{icon} {title}</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {items.map((it, i) => (
            <li key={it.topic} className="flex gap-3 text-sm">
              {numbered && <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand/15 text-xs font-semibold text-brand">{i + 1}</span>}
              <div><span className="font-medium">{it.topic}: </span><span className="text-muted-foreground">{it.text}</span></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
