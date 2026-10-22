import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchers, logActivity, qk, todayISO, unwrap, type Followup } from "@/lib/admin-api";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing?: Followup | null;
  presetLeadId?: string;
  presetClientId?: string;
}

export function FollowupDialog({ open, onOpenChange, editing, presetLeadId, presetClientId }: Props) {
  const qc = useQueryClient();
  const leads = useQuery({ queryKey: qk.leads, queryFn: fetchers.leads, enabled: open });
  const clients = useQuery({ queryKey: qk.clients, queryFn: fetchers.clients, enabled: open });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [due, setDue] = useState(todayISO());
  const [link, setLink] = useState("none");

  useEffect(() => {
    if (!open) return;
    setTitle(editing?.title ?? "");
    setDescription(editing?.description ?? "");
    setDue(editing?.due_date ?? todayISO());
    const l = editing?.lead_id ?? presetLeadId, c = editing?.client_id ?? presetClientId;
    setLink(c ? `c:${c}` : l ? `l:${l}` : "none");
  }, [open, editing, presetLeadId, presetClientId]);

  const save = useMutation({
    mutationFn: async () => {
      const t = title.trim();
      if (t.length < 2 || t.length > 160) throw new Error("Informe um título entre 2 e 160 caracteres.");
      if (!due) throw new Error("Informe o prazo.");
      const payload = {
        title: t,
        description: description.trim().slice(0, 1000) || null,
        due_date: due,
        lead_id: link.startsWith("l:") ? link.slice(2) : null,
        client_id: link.startsWith("c:") ? link.slice(2) : null,
      };
      if (editing) unwrap(await supabase.from("followups").update(payload).eq("id", editing.id).select().single());
      else {
        const row = unwrap(await supabase.from("followups").insert(payload).select().single());
        await logActivity("create_followup", "followup", row.id);
      }
    },
    onSuccess: () => { toast.success("Lembrete salvo."); qc.invalidateQueries({ queryKey: qk.followups }); onOpenChange(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? "Editar lembrete" : "Novo lembrete"}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5"><Label htmlFor="f-title">Título</Label><Input id="f-title" maxLength={160} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="f-desc">Descrição</Label><Textarea id="f-desc" maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid gap-1.5"><Label htmlFor="f-due">Prazo</Label><Input id="f-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} /></div>
          <div className="grid gap-1.5">
            <Label>Vincular a</Label>
            <Select value={link} onValueChange={setLink}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem vínculo</SelectItem>
                {(clients.data ?? []).map((c) => <SelectItem key={c.id} value={`c:${c.id}`}>Cliente: {c.company}</SelectItem>)}
                {(leads.data ?? []).map((l) => <SelectItem key={l.id} value={`l:${l.id}`}>Lead: {l.company} — {l.name}</SelectItem>)}
              </SelectContent>
            </Select>
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
