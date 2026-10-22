import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Panel, EmptyState, LoadingRows, ErrorBox } from "@/components/admin/ui";
import { FollowupDialog } from "@/components/admin/FollowupDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { fetchers, fmtDate, qk, todayISO, unwrap, type Followup } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/lembretes")({ component: Lembretes });

function Lembretes() {
  const qc = useQueryClient();
  const items = useQuery({ queryKey: qk.followups, queryFn: fetchers.followups });
  const leads = useQuery({ queryKey: qk.leads, queryFn: fetchers.leads });
  const clients = useQuery({ queryKey: qk.clients, queryFn: fetchers.clients });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Followup | null>(null);
  const [toDelete, setToDelete] = useState<Followup | null>(null);
  const today = todayISO();

  const toggle = useMutation({
    mutationFn: async (f: Followup) => unwrap(await supabase.from("followups").update({ completed: !f.completed }).eq("id", f.id).select().single()),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.followups }),
    onError: () => toast.error("Não foi possível atualizar."),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("followups").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Lembrete excluído."); qc.invalidateQueries({ queryKey: qk.followups }); setToDelete(null); },
    onError: () => toast.error("Não foi possível excluir."),
  });

  const link = (f: Followup) => {
    if (f.client_id) return `Cliente: ${clients.data?.find((c) => c.id === f.client_id)?.company ?? "—"}`;
    if (f.lead_id) return `Lead: ${leads.data?.find((l) => l.id === f.lead_id)?.company ?? "—"}`;
    return null;
  };
  const all = items.data ?? [];
  const groups = [
    { title: "Vencidos", rows: all.filter((f) => !f.completed && f.due_date < today), tone: "text-danger" },
    { title: "Próximos", rows: all.filter((f) => !f.completed && f.due_date >= today), tone: "text-foreground" },
    { title: "Concluídos", rows: all.filter((f) => f.completed), tone: "text-muted-foreground" },
  ];

  return (
    <>
      <PageHeader title="Lembretes" description="Acompanhe os próximos contatos e tarefas."
        action={<Button onClick={() => { setEditing(null); setOpen(true); }}><Plus /> Novo lembrete</Button>} />
      {items.isLoading ? <Panel><LoadingRows /></Panel> : items.isError ? <Panel><ErrorBox /></Panel> : all.length === 0 ? <Panel><EmptyState title="Nenhum lembrete" text="Crie lembretes para não esquecer os próximos contatos." /></Panel> : (
        <div className="grid gap-6">
          {groups.map((g) => g.rows.length > 0 && (
            <section key={g.title}>
              <h2 className={cn("mb-2 text-sm font-semibold uppercase tracking-wider", g.tone)}>{g.title} ({g.rows.length})</h2>
              <Panel className="divide-y divide-border">
                {g.rows.map((f) => (
                  <div key={f.id} className="flex items-start gap-3 p-4">
                    <Checkbox className="mt-1" checked={f.completed} onCheckedChange={() => toggle.mutate(f)} aria-label={f.completed ? "Marcar como pendente" : "Marcar como concluído"} />
                    <div className="min-w-0 flex-1">
                      <p className={cn("font-medium", f.completed && "line-through text-muted-foreground")}>{f.title}</p>
                      {f.description && <p className="mt-0.5 text-sm text-muted-foreground">{f.description}</p>}
                      <p className="mt-1 text-xs text-muted-foreground">Prazo: {fmtDate(f.due_date)}{link(f) && ` · ${link(f)}`}</p>
                    </div>
                    <Button size="icon" variant="ghost" aria-label="Editar" onClick={() => { setEditing(f); setOpen(true); }}><Pencil /></Button>
                    <Button size="icon" variant="ghost" aria-label="Excluir" onClick={() => setToDelete(f)}><Trash2 /></Button>
                  </div>
                ))}
              </Panel>
            </section>
          ))}
        </div>
      )}
      <FollowupDialog open={open} onOpenChange={setOpen} editing={editing} />
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Excluir lembrete?</AlertDialogTitle><AlertDialogDescription>“{toDelete?.title}” será removido permanentemente.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => toDelete && remove.mutate(toDelete.id)}>Excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
