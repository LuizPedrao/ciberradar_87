import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { qk, unwrap } from "@/lib/admin-api";
import { onlyDigits, isValidIntlNumber } from "@/lib/whatsapp";

export const Route = createFileRoute("/admin/configuracoes")({ component: Config });

const APP_VERSION = "1.0.0";

function Config() {
  const qc = useQueryClient();
  const { userEmail } = Route.useRouteContext();
  const settings = useQuery({ queryKey: qk.settings, queryFn: async () => unwrap(await supabase.from("app_settings").select("*").eq("id", 1).single()) });
  const [wa, setWa] = useState("");
  const [email, setEmail] = useState("");
  useEffect(() => { if (settings.data) { setWa(settings.data.whatsapp_number ?? ""); setEmail(settings.data.contact_email ?? ""); } }, [settings.data]);

  const save = useMutation({
    mutationFn: async () => {
      const n = onlyDigits(wa);
      if (n && !isValidIntlNumber(n)) throw new Error("Use o formato internacional: código do país + DDD + número (ex.: 5511987654321).");
      const e = email.trim().toLowerCase();
      if (e && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) throw new Error("E-mail inválido.");
      unwrap(await supabase.from("app_settings").update({ whatsapp_number: n || null, contact_email: e || null }).eq("id", 1).select().single());
    },
    onSuccess: () => { toast.success("Configurações salvas."); qc.invalidateQueries({ queryKey: qk.settings }); qc.invalidateQueries({ queryKey: ["public-settings"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader title="Configurações" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-6">
          <h2 className="font-semibold">Contato público</h2>
          {settings.isLoading ? <Skeleton className="mt-4 h-32" /> : (
            <form className="mt-4 grid gap-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
              <div className="grid gap-1.5">
                <Label htmlFor="wa">WhatsApp comercial (formato internacional)</Label>
                <Input id="wa" inputMode="numeric" placeholder="5511987654321" maxLength={20} value={wa} onChange={(e) => setWa(e.target.value)} />
                <p className="text-xs text-muted-foreground">Somente números: 55 + DDD + número.</p>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="ce">E-mail de contato</Label>
                <Input id="ce" type="email" maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" disabled={save.isPending} className="justify-self-start">{save.isPending && <Loader2 className="animate-spin" />} Salvar</Button>
            </form>
          )}
        </Panel>
        <Panel className="p-6">
          <h2 className="font-semibold">Conta e sistema</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div><dt className="text-muted-foreground">Conta autenticada</dt><dd className="font-medium">{userEmail}</dd></div>
            <div><dt className="text-muted-foreground">Papel</dt><dd className="font-medium">Administrador</dd></div>
            <div><dt className="text-muted-foreground">Versão</dt><dd className="font-medium">CiberRadar PME {APP_VERSION}</dd></div>
          </dl>
          <Button variant="outline" className="mt-6" onClick={() => supabase.auth.signOut()}><LogOut /> Sair</Button>
        </Panel>
      </div>
    </>
  );
}
