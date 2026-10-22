import { PublicLayout } from "./SiteFooter";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 py-16 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mt-3 [&_p]:text-muted-foreground">
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        <p className="text-sm">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
        {children}
      </article>
    </PublicLayout>
  );
}
