import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/admin_/login")({
  validateSearch: z.object({ denied: z.coerce.number().optional() }),
  head: () => ({
    meta: [
      { title: "Acesso administrativo — CiberRadar PME" },
      { name: "description", content: "Área restrita para administradores do CiberRadar PME." },
      { property: "og:title", content: "Acesso administrativo — CiberRadar PME" },
      { property: "og:description", content: "Área restrita." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { denied } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(denied ? "Esta conta não possui acesso administrativo." : null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setLoading(false);
      return setError("E-mail ou senha inválidos.");
    }
    const { data: ok } = await supabase.rpc("is_admin");
    if (!ok) {
      await supabase.auth.signOut();
      setLoading(false);
      return setError("Esta conta não possui acesso administrativo.");
    }
    navigate({ to: "/admin" });
  }

  return (
    <div className="dark flex min-h-screen items-center justify-center bg-hero px-4 text-foreground">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-2xl">
        <Logo />
        <h1 className="mt-6 flex items-center gap-2 text-xl font-semibold"><Lock className="h-5 w-5 text-brand" /> Acesso administrativo</h1>
        <div className="mt-6 grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" autoComplete="current-password" required maxLength={200} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="hero" disabled={loading}>{loading && <Loader2 className="animate-spin" />} Entrar</Button>
        </div>
      </form>
    </div>
  );
}
