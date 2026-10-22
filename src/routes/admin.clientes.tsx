import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Panel, EmptyState, LoadingRows, ErrorBox } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CLIENT_STATUS, fetchers, fmtDate, logActivity, qk, unwrap, type Client, type ClientStatus } from "@/lib/admin-api";
import { formatBrPhone, normalizeBrPhone } from "@/lib/whatsapp";

export const Route = createFileRoute("/admin/clientes")({ component: Clientes });

function Clientes() {
  const clients = useQuery({ queryKey: qk.clients, queryFn: fetchers.clients });
  const [editing, setEditing] = useState<Client | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <PageHeader title="Clientes" description="Empresas atendidas. Converta leads para criar clientes sem redigitar dados."
        action={<Button onClick={() => { setEditing(null); setOpen(true); }}><Plus /> Novo cliente</Button>} />
      <Panel className="overflow-hidden">
        {clients.isLoading ? <LoadingRows /> : clients.isError ? <ErrorBox /> : !clients.data?.length ? <EmptyState title="Nenhum cliente ainda" text="Converta um lead ou cadastre um cliente manualmente." /> : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Contato</TableHead><TableHead>Empresa</TableHead><TableHead>WhatsApp</TableHead><TableHead>Situação</TableHead><TableHead>Serviço de interesse</TableHead><TableHead>Conversão</TableHead></TableRow></TableHeader>
              <TableBody>
                {clients.data.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer" tabIndex={0} onClick={() => { setEditing(c); setOpen(true); }} onKeyDown={(e) => e.key === "Enter" && (setEditing(c), setOpen(true))}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.company}</TableCell>
                    <TableCell className="whitespace-nowrap">{c.whatsapp ? formatBrPhone(c.whatsapp) : "—"}</TableCell>
                    <TableCell><Badge variant="secondary">{CLIENT_STATUS[c.status]}</Badge></TableCell>
                    <TableCell>{c.service_interest ?? "—"}</TableCell>
                    <TableCell>{fmtDate(c.converted_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>
      <ClientDialog open={open} onOpenChange={setOpen} editing={editing} />
    </>
  );
}

function ClientDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing: Client | null }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ name: "", company: "", whatsapp: "", email: "", status: "ativo" as ClientStatus, service_interest: "", notes: "" });
  useEffect(() => {
    if (open) setF({
      name: editing?.name ?? "", company: editing?.company ?? "", whatsapp: editing?.whatsapp ?? "", email: editing?.email ?? "",
      status: editing?.status ?? "ativo", service_interest: editing?.service_interest ?? "", notes: editing?.notes ?? "",
    });
  }, [open, editing]);

  const save = useMutation({
    mutationFn: async () => {
      const name = f.name.trim(), company = f.company.trim();
      if (name.length < 2 || company.length < 2) throw new Error("Informe nome do contato e empresa.");
      const phone = f.whatsapp.trim() ? normalizeBrPhone(f.whatsapp) : null;
      if (f.whatsapp.trim() && !phone) throw new Error("WhatsApp inválido.");
      const email = f.email.trim().toLowerCase() || null;
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("E-mail inválido.");
      const payload = { name: name.slice(0, 120), company: company.slice(0, 120), whatsapp: phone, email, status: f.status,
        service_interest: f.service_interest.trim().slice(0, 200) || null, notes: f.notes.trim().slice(0, 2000) || null };
      const res = editing
        ? await supabase.from("clients").update(payload).eq("id", editing.id).select().single()
        : await supabase.from("clients").insert(payload).select().single();
      if (res.error?.code === "23505") throw new Error("Já existe um cliente com essa empresa e WhatsApp.");
      const row = unwrap(res);
      await logActivity(editing ? "update_client" : "create_client", "client", row.id);
    },
    onSuccess: () => { toast.success("Cliente salvo."); qc.invalidateQueries({ queryKey: qk.clients }); onOpenChange(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? "Editar cliente" : "Novo cliente"}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5"><Label htmlFor="c-name">Nome do contato</Label><Input id="c-name" maxLength={120} value={f.name} onChange={set("name")} /></div>
          <div className="grid gap-1.5"><Label htmlFor="c-company">Empresa</Label><Input id="c-company" maxLength={120} value={f.company} onChange={set("company")} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5"><Label htmlFor="c-wa">WhatsApp</Label><Input id="c-wa" maxLength={25} value={f.whatsapp} onChange={set("whatsapp")} /></div>
            <div className="grid gap-1.5"><Label htmlFor="c-email">E-mail</Label><Input id="c-email" type="email" maxLength={254} value={f.email} onChange={set("email")} /></div>
          </div>
          <div className="grid gap-1.5"><Label>Situação</Label>
            <Select value={f.status} onValueChange={(v) => setF({ ...f, status: v as ClientStatus })}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(CLIENT_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="grid gap-1.5"><Label htmlFor="c-svc">Serviço de interesse</Label><Input id="c-svc" maxLength={200} value={f.service_interest} onChange={set("service_interest")} /></div>
          <div className="grid gap-1.5"><Label htmlFor="c-notes">Observações</Label><Textarea id="c-notes" maxLength={2000} value={f.notes} onChange={set("notes")} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending && <Loader2 className="animate-spin" />} Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
