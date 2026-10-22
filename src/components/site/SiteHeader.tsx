import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/#inicio", label: "Início" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#beneficios", label: "Benefícios" },
  { href: "/#faq", label: "Perguntas frequentes" },
  { href: "/contato", label: "Contato" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" aria-label="CiberRadar PME — início">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Principal">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="hidden lg:block">
          <Button asChild variant="hero">
            <Link to="/diagnostico">Fazer diagnóstico gratuito</Link>
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <nav className="border-t border-border px-4 pb-4 lg:hidden" aria-label="Menu móvel">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="block py-3 text-foreground">
              {n.label}
            </a>
          ))}
          <Button asChild variant="hero" className="mt-2 w-full">
            <Link to="/diagnostico">Fazer diagnóstico gratuito</Link>
          </Button>
        </nav>
      )}
    </header>
  );
}
