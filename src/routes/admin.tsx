import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, Briefcase, ClipboardCheck, PackageCheck, BellRing, Settings, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login" });
    const { data: ok, error } = await supabase.rpc("is_admin");
    if (error || !ok) {
      await supabase.auth.signOut();
      throw redirect({ to: "/admin/login", search: { denied: 1 } });
    }
    return { userEmail: data.user.email ?? "" };
  },
  head: () => ({
    meta: [
      { title: "Painel — CiberRadar PME" },
      { name: "description", content: "Painel administrativo do CiberRadar PME." },
      { property: "og:title", content: "Painel — CiberRadar PME" },
      { property: "og:description", content: "Área restrita." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { to: "/admin/leads", label: "Leads", icon: Users },
  { to: "/admin/clientes", label: "Clientes", icon: Briefcase },
  { to: "/admin/diagnosticos", label: "Diagnósticos", icon: ClipboardCheck },
  { to: "/admin/entregas", label: "Entregas", icon: PackageCheck },
  { to: "/admin/lembretes", label: "Lembretes", icon: BellRing },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate({ to: "/admin/login" });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const nav = (
    <nav className="grid gap-1 p-3" aria-label="Painel">
      {NAV.map((n) => (
        <Link key={n.to} to={n.to} activeOptions={{ exact: "exact" in n }} onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent"
          activeProps={{ className: "bg-sidebar-accent font-medium text-sidebar-accent-foreground" }}>
          <n.icon className="h-4 w-4" /> {n.label}
        </Link>
      ))}
      <button onClick={() => supabase.auth.signOut()} className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent">
        <LogOut className="h-4 w-4" /> Sair
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-sidebar-border bg-sidebar lg:block">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5"><Logo /></div>
        {nav}
      </aside>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Logo />
        <Button variant="ghost" size="icon" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
      </header>
      {open && <div className="border-b border-border bg-sidebar lg:hidden">{nav}</div>}
      <main className={cn("lg:pl-60")}>
        <div className="mx-auto max-w-6xl p-4 md:p-8"><Outlet /></div>
      </main>
    </div>
  );
}
