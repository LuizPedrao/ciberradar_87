import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Panel, EmptyState, LoadingRows, ErrorBox } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DELIVERABLE_STATUS, DELIVERABLE_TYPES, fetchers, fmtDate, logActivity, qk, unwrap, type Deliverable, type DeliverableStatus } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/entregas")({ component: Entregas });

function Entregas() {
  const qc = useQueryClient();
  const items = useQuery({ queryKey: qk.deliverables, queryFn: fetchers.deliverables });
  const clients = useQuery({ queryKey: qk.clients, queryFn: fetchers.clients });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Deliverable | null>(null);
  const clientName = (id: string) => clients.data?.find((c) => c.id === id)?.company ?? "—";

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: DeliverableStatus }) => {
      unwrap(await supabase.from("deliverables").update({ status }).eq("id", id).select().single());
      await logActivity(`deliverable_${status}`, "deliverable", id);
    },
    onSuccess: () => { toast.success("Andamento atualizado."); qc.invalidateQueries({ queryKey: qk.deliverables }); },
    onError: () => toast.error("Não foi possível atualizar."),
  });

  const noClients = clients.data && clients.data.length === 0;
  return (
    <>
      <PageHeader title="Entregas" description="Entregáveis comerciais combinados com cada cliente."
        action={<Button disabled={!!noClients} onClick={() => { setEditing(null); setOpen(true); }}><Plus /> Nova entrega</Button>} />
      <Panel className="overflow-hidden">
        {items.isLoading ? <LoadingRows /> : items.isError ? <ErrorBox /> : !items.data?.length ? (
          <EmptyState title="Nenhuma entrega cadastrada" text={noClients ? "Cadastre ou converta um cliente antes de criar entregas." : "Crie a primeira entrega para um cliente."} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Tipo</TableHead><TableHead>Descrição</TableHead><TableHead>Prevista</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {items.data.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{clientName(d.client_id)}</TableCell>
                    <TableCell>{d.type}</TableCell>
                    <TableCell className="max-w-xs truncate">{d.description ?? "—"}</TableCell>
                    <TableCell>{fmtDate(d.due_date)}</TableCell>
                    <TableCell className="min-w-40">
                      <Select value={d.status} onValueChange={(v) => setStatus.mutate({ id: d.id, status: v as DeliverableStatus })}>
                        <SelectTrigger aria-label="Status da entrega" className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>{Object.entries(DELIVERABLE_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><Button size="sm" variant="ghost" onClick={() => { setEditing(d); setOpen(true); }}>Editar</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>
      <DeliverableDialog open={open} onOpenChange={setOpen} editing={editing} clients={clients.data ?? []} />
    </>
  );
}

function DeliverableDialog({ open, onOpenChange, editing, clients }: { open: boolean; onOpenChange: (o: boolean) => void; editing: Deliverable | null; clients: { id: string; company: string }[] }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ client_id: "", type: DELIVERABLE_TYPES[0], description: "", due_date: "", status: "pendente" as DeliverableStatus });
  useEffect(() => {
    if (open) setF({ client_id: editing?.client_id ?? "", type: editing?.type ?? DELIVERABLE_TYPES[0], description: editing?.description ?? "", due_date: editing?.due_date ?? "", status: editing?.status ?? "pendente" });
  }, [open, editing]);
  const save = useMutation({
    mutationFn: async () => {
      if (!f.client_id) throw new Error("Selecione o cliente.");
      const payload = { client_id: f.client_id, type: f.type.trim().slice(0, 120), description: f.description.trim().slice(0, 1000) || null, due_date: f.due_date || null, status: f.status };
      if (payload.type.length < 2) throw new Error("Informe o tipo.");
      const row = unwrap(editing
        ? await supabase.from("deliverables").update(payload).eq("id", editing.id).select().single()
        : await supabase.from("deliverables").insert(payload).select().single());
      await logActivity(editing ? "update_deliverable" : "create_deliverable", "deliverable", row.id);
    },
    onSuccess: () => { toast.success("Entrega salva."); qc.invalidateQueries({ queryKey: qk.deliverables }); onOpenChange(false); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? "Editar entrega" : "Nova entrega"}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5"><Label>Cliente</Label>
            <Select value={f.client_id} onValueChange={(v) => setF({ ...f, client_id: v })}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.company}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="grid gap-1.5"><Label>Tipo</Label>
            <Select value={f.type} onValueChange={(v) => setF({ ...f, type: v })}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{[...new Set([...DELIVERABLE_TYPES, f.type])].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="grid gap-1.5"><Label htmlFor="d-desc">Descrição</Label><Textarea id="d-desc" maxLength={1000} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5"><Label htmlFor="d-due">Data prevista</Label><Input id="d-due" type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Status</Label>
              <Select value={f.status} onValueChange={(v) => setF({ ...f, status: v as DeliverableStatus })}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(DELIVERABLE_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending && <Loader2 className="animate-spin" />} Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
