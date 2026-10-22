import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-2 text-sm text-muted-foreground">
            © {new Date().getFullYear()} CiberRadar PME. Todos os direitos reservados.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground" aria-label="Rodapé">
          <Link to="/privacidade" className="hover:text-foreground">Política de privacidade</Link>
          <Link to="/termos" className="hover:text-foreground">Termos de uso</Link>
          <Link to="/contato" className="hover:text-foreground">Contato</Link>
          <Link to="/admin/login" className="text-muted-foreground/50 hover:text-foreground">Acesso restrito</Link>
        </nav>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeaderLazy />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

import { SiteHeader as SiteHeaderLazy } from "./SiteHeader";
