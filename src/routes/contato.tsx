import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, MessageCircle } from "lucide-react";
import { PublicLayout } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { publicSettingsQuery } from "@/lib/public-settings";
import { isValidIntlNumber } from "@/lib/whatsapp";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — CiberRadar PME" },
      { name: "description", content: "Fale com a equipe do CiberRadar PME sobre segurança digital para sua empresa." },
      { property: "og:title", content: "Contato — CiberRadar PME" },
      { property: "og:description", content: "Canais de contato do CiberRadar PME." },
    ],
  }),
  component: Contato,
});

function Contato() {
  const { data, isLoading } = useQuery(publicSettingsQuery);
  const wa = data?.whatsapp_number;
  return (
    <PublicLayout>
      <section className="mx-auto max-w-2xl px-4 py-20">
        <h1 className="font-display text-3xl font-bold">Contato</h1>
        <p className="mt-3 text-muted-foreground">A forma mais rápida de receber orientação é fazer o diagnóstico e solicitar contato ao final.</p>
        <div className="mt-8 grid gap-4">
          {isLoading ? <Skeleton className="h-20" /> : (
            <>
              {isValidIntlNumber(wa) && (
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 hover:border-brand/50">
                  <MessageCircle className="text-brand" /> WhatsApp de atendimento
                </a>
              )}
              {data?.contact_email && (
                <a href={`mailto:${data.contact_email}`} className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 hover:border-brand/50">
                  <Mail className="text-brand" /> {data.contact_email}
                </a>
              )}
              {!isValidIntlNumber(wa) && !data?.contact_email && (
                <p className="rounded-xl border border-border bg-card p-5 text-muted-foreground">Os canais de contato estão sendo configurados. Faça o diagnóstico e deixe seus dados para receber retorno.</p>
              )}
            </>
          )}
        </div>
        <Button asChild variant="hero" className="mt-8"><Link to="/diagnostico">Fazer diagnóstico gratuito</Link></Button>
      </section>
    </PublicLayout>
  );
}
