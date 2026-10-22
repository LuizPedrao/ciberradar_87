import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, KeyRound, Smartphone, DatabaseBackup, Laptop, UserCog, GraduationCap,
  ClipboardList, Radar, MessageSquareText, Info, ShieldCheck, Lock,
} from "lucide-react";
import { PublicLayout } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CiberRadar PME — Descubra o nível de proteção digital da sua empresa" },
      { name: "description", content: "Diagnóstico gratuito de práticas de segurança digital para micro, pequenas e médias empresas. Resultado imediato com recomendações." },
      { property: "og:title", content: "CiberRadar PME — Diagnóstico de segurança digital" },
      { property: "og:description", content: "Responda 10 perguntas e descubra pontos de atenção na segurança digital da sua empresa." },
    ],
  }),
  component: Index,
});

const STEPS = [
  { icon: ClipboardList, title: "Responda ao diagnóstico", text: "Dez perguntas simples sobre as práticas da sua empresa. Sem termos técnicos." },
  { icon: Radar, title: "Descubra seus pontos de atenção", text: "Veja na hora sua pontuação, pontos positivos e o que precisa de cuidado." },
  { icon: MessageSquareText, title: "Receba recomendações", text: "Orientações práticas e, se quiser, solicite uma conversa com um especialista." },
];

const BENEFITS = [
  { icon: KeyRound, title: "Segurança de senhas", text: "Entenda se os acessos da equipe estão bem protegidos." },
  { icon: Smartphone, title: "Autenticação multifator", text: "Uma camada extra que dificulta o uso de senhas vazadas." },
  { icon: DatabaseBackup, title: "Backup e recuperação", text: "Saiba se seus dados podem ser recuperados após um problema." },
  { icon: Laptop, title: "Proteção de dispositivos", text: "Computadores atualizados e protegidos contra ameaças comuns." },
  { icon: UserCog, title: "Controle de acessos", text: "Cada pessoa com o acesso certo — nem mais, nem menos." },
  { icon: GraduationCap, title: "Conscientização da equipe", text: "Pessoas preparadas para reconhecer golpes e phishing." },
];

const FAQ = [
  ["O diagnóstico é gratuito?", "Sim. O diagnóstico e o resultado são gratuitos e não exigem cadastro."],
  ["Preciso ter conhecimento técnico?", "Não. As perguntas foram escritas para gestores e empresários, em linguagem simples. Se não souber uma resposta, escolha “Não sei”."],
  ["Quanto tempo leva?", "Em média de 3 a 5 minutos."],
  ["Minha empresa precisa instalar algum programa?", "Não. Tudo acontece no navegador e nenhum sistema da empresa é acessado."],
  ["O resultado é uma auditoria?", "Não. É uma avaliação orientativa baseada nas suas respostas. Não substitui auditoria ou análise técnica especializada."],
  ["Posso solicitar uma orientação especializada?", "Sim. Ao final do diagnóstico você pode deixar seus dados para receber contato sobre os próximos passos."],
];

function DashboardPreview() {
  return (
    <div className="relative animate-fade-up" aria-label="Prévia ilustrativa do painel" role="img">
      <div className="absolute -inset-6 rounded-3xl bg-brand/10 blur-3xl" />
      <div className="relative rounded-2xl border border-border bg-card/80 p-5 shadow-2xl backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Exemplo ilustrativo</span>
          <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs text-brand">Prévia</span>
        </div>
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-2 flex flex-col items-center justify-center rounded-xl bg-secondary p-4">
            <div className="relative h-24 w-24">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="42" stroke="var(--border)" strokeWidth="10" fill="none" />
                <circle cx="50" cy="50" r="42" stroke="var(--brand)" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray="264" strokeDashoffset="90" />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <ShieldCheck className="h-8 w-8 text-brand" />
              </div>
            </div>
            <span className="mt-2 text-xs text-muted-foreground">Indicador de proteção</span>
          </div>
          <div className="col-span-3 rounded-xl bg-secondary p-4">
            <span className="text-xs text-muted-foreground">Avaliação por tema</span>
            <div className="mt-3 flex h-24 items-end gap-2">
              {[60, 85, 40, 70, 30, 90].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-brand-gradient opacity-80" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          {[
            { icon: Lock, l: "Acessos" },
            { icon: DatabaseBackup, l: "Backup" },
            { icon: Laptop, l: "Dispositivos" },
          ].map(({ icon: I, l }, i) => (
            <div key={l} className={`${i === 2 ? "col-span-1" : "col-span-2"} flex items-center gap-2 rounded-xl bg-secondary p-3`}>
              <I className="h-4 w-4 text-brand" />
              <span className="truncate text-xs">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Index() {
  return (
    <PublicLayout>
      <section id="inicio" className="relative overflow-hidden bg-hero">
        <div className="absolute inset-0 grid-lines" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:py-28 lg:grid-cols-2">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/5 px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Descubra o nível de proteção digital da sua empresa.
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight md:text-5xl">
              Sua empresa está realmente <span className="text-brand">protegida</span> contra ameaças digitais?
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Descubra como estão as práticas de segurança digital do seu negócio, identifique pontos de atenção e receba recomendações iniciais em poucos minutos.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="hero" size="xl">
                <Link to="/diagnostico">Analisar minha empresa <ArrowRight /></Link>
              </Button>
              <Button asChild variant="glass" size="xl">
                <a href="#como-funciona">Entenda como funciona</a>
              </Button>
            </div>
          </div>
          <DashboardPreview />
        </div>
      </section>

      <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
        <h2 className="font-display text-3xl font-bold">Como funciona</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand/15 text-brand"><s.icon className="h-5 w-5" /></span>
                <span className="font-display text-sm text-muted-foreground">Etapa {i + 1}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="beneficios" className="scroll-mt-20 border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="font-display text-3xl font-bold">O que o diagnóstico avalia</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.title} className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand/50">
                <b.icon className="h-6 w-6 text-brand" />
                <h3 className="mt-4 font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-20">
        <h2 className="font-display text-3xl font-bold">Sobre o diagnóstico</h2>
        <p className="mt-4 text-muted-foreground">
          A avaliação utiliza exclusivamente as respostas fornecidas por você. Nenhum sistema, rede ou dispositivo da sua empresa é acessado, e não pedimos senhas, endereços IP ou documentos.
        </p>
        <div className="mt-6 flex gap-3 rounded-xl border border-brand/30 bg-brand/10 p-4 text-sm">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <p>Esta avaliação é orientativa, baseada nas informações fornecidas e não substitui uma auditoria ou análise técnica especializada.</p>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-20">
        <h2 className="font-display text-3xl font-bold">Perguntas frequentes</h2>
        <Accordion type="single" collapsible className="mt-6">
          {(FAQ as [string, string][]).map(([q, a]) => (
            <AccordionItem key={q} value={q}>
              <AccordionTrigger className="text-left">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl border border-border bg-hero p-10 text-center">
          <h2 className="font-display text-3xl font-bold">Leva só alguns minutos.</h2>
          <p className="mt-3 text-muted-foreground">Gratuito, sem cadastro e com resultado imediato.</p>
          <Button asChild variant="hero" size="xl" className="mt-6">
            <Link to="/diagnostico">Fazer diagnóstico gratuito <ArrowRight /></Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
