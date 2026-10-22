import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, MessageCircle, BadgeCheck, Loader2, BellPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Panel, EmptyState, LoadingRows, ErrorBox, LeadStatusBadge, ScoreBadge } from "@/components/admin/ui";
import { AnswersList } from "@/components/admin/AnswersList";
import { FollowupDialog } from "@/components/admin/FollowupDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LEAD_STATUS, fetchers, fmtDate, logActivity, qk, unwrap, type Lead, type LeadStatus } from "@/lib/admin-api";
import { formatBrPhone, leadChatLink } from "@/lib/whatsapp";
import { COMPANY_SIZES } from "@/lib/lead-schema";

export const Route = createFileRoute("/admin/leads")({ component: LeadsPage });

function LeadsPage() {
  const leads = useQuery({ queryKey: qk.leads, queryFn: fetchers.leads });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | LeadStatus>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (leads.data ?? []).filter((l) =>
      (status === "all" || l.status === status) &&
      (!term || `${l.name} ${l.company} ${l.whatsapp} ${l.email ?? ""}`.toLowerCase().includes(term)) &&
      (!from || l.created_at.slice(0, 10) >= from) &&
      (!to || l.created_at.slice(0, 10) <= to));
  }, [leads.data, q, status, from, to]);
  const selected = leads.data?.find((l) => l.id === selectedId) ?? null;

  return (
    <>
      <PageHeader title="Leads" description="Solicitações de orientação recebidas pelo diagnóstico." />
      <Panel className="mb-4 grid gap-3 p-4 md:grid-cols-[1fr_180px_150px_150px]">
        <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input aria-label="Pesquisar" placeholder="Pesquisar nome, empresa, telefone…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger aria-label="Filtrar por status"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Todos os status</SelectItem>{Object.entries(LEAD_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
        </Select>
        <Input type="date" aria-label="Data inicial" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" aria-label="Data final" value={to} onChange={(e) => setTo(e.target.value)} />
      </Panel>
      <Panel className="overflow-hidden">
        {leads.isLoading ? <LoadingRows /> : leads.isError ? <ErrorBox /> : rows.length === 0 ? (
          <EmptyState title={leads.data?.length ? "Nenhum lead com esses filtros" : "Nenhum lead ainda"} text={leads.data?.length ? undefined : "Quando um visitante solicitar orientação, ele aparecerá aqui."} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Empresa</TableHead><TableHead>WhatsApp</TableHead><TableHead>Cadastro</TableHead><TableHead>Pontuação</TableHead><TableHead>Classificação</TableHead><TableHead>Status</TableHead><TableHead>Próxima ação</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.map((l) => (
                  <TableRow key={l.id} className="cursor-pointer" onClick={() => setSelectedId(l.id)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setSelectedId(l.id)}>
                    <TableCell className="font-medium">{l.name}</TableCell>
                    <TableCell>{l.company}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatBrPhone(l.whatsapp)}</TableCell>
                    <TableCell>{fmtDate(l.created_at)}</TableCell>
                    <TableCell><ScoreBadge score={l.score} /></TableCell>
                    <TableCell className="text-xs">{l.classification}</TableCell>
                    <TableCell><LeadStatusBadge status={l.status} /></TableCell>
                    <TableCell>{fmtDate(l.next_contact_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>
      <LeadSheet lead={selected} onClose={() => setSelectedId(null)} />
    </>
  );
}

function LeadSheet({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const [followOpen, setFollowOpen] = useState(false);
  const notes = useQuery({
    queryKey: qk.notes(lead?.id ?? ""),
    enabled: !!lead,
    queryFn: async () => unwrap(await supabase.from("lead_notes").select("*").eq("lead_id", lead!.id).order("created_at", { ascending: false })),
  });

  const update = useMutation({
    mutationFn: async (patch: Partial<Pick<Lead, "status" | "next_contact_at">>) => {
      unwrap(await supabase.from("leads").update(patch).eq("id", lead!.id).select().single());
      await logActivity("update_lead", "lead", lead!.id);
    },
    onSuccess: () => { toast.success("Lead atualizado."); qc.invalidateQueries({ queryKey: qk.leads }); },
    onError: () => toast.error("Não foi possível atualizar o lead."),
  });
  const addNote = useMutation({
    mutationFn: async () => {
      const content = note.trim();
      if (!content) throw new Error("Escreva a observação.");
      unwrap(await supabase.from("lead_notes").insert({ lead_id: lead!.id, content: content.slice(0, 2000) }).select().single());
    },
    onSuccess: () => { setNote(""); toast.success("Observação registrada."); qc.invalidateQueries({ queryKey: qk.notes(lead!.id) }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const convert = useMutation({
    mutationFn: async () => unwrap(await supabase.rpc("convert_lead_to_client", { _lead_id: lead!.id })),
    onSuccess: () => { toast.success("Lead convertido em cliente."); qc.invalidateQueries({ queryKey: qk.leads }); qc.invalidateQueries({ queryKey: qk.clients }); },
    onError: () => toast.error("Não foi possível converter o lead."),
  });

  return (
    <Sheet open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {lead && (
          <>
            <SheetHeader>
              <SheetTitle>{lead.name}</SheetTitle>
              <SheetDescription>{lead.company} · cadastrado em {fmtDate(lead.created_at)}</SheetDescription>
            </SheetHeader>
            <div className="grid gap-6 px-4 pb-8">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="WhatsApp" value={formatBrPhone(lead.whatsapp)} />
                <Info label="E-mail" value={lead.email ?? "—"} />
                <Info label="Colaboradores" value={COMPANY_SIZES.find((s) => s.value === lead.company_size)?.label ?? lead.company_size} />
                <Info label="Pontuação" value={`${lead.score}/100 · ${lead.classification}`} />
                <Info label="Consentimento de contato" value={fmtDate(lead.consent_contact_at)} />
                <Info label="Aceita novidades" value={lead.consent_marketing ? "Sim" : "Não"} />
              </div>
              {lead.main_concern && <div className="rounded-lg bg-muted p-3 text-sm"><span className="font-medium">Principal preocupação: </span>{lead.main_concern}</div>}
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="brand" size="sm"><a href={leadChatLink(lead.whatsapp)} target="_blank" rel="noopener noreferrer"><MessageCircle /> Abrir WhatsApp</a></Button>
                <Button size="sm" variant="outline" onClick={() => setFollowOpen(true)}><BellPlus /> Agendar lembrete</Button>
                <Button size="sm" onClick={() => convert.mutate()} disabled={convert.isPending || lead.status === "convertido"}>
                  {convert.isPending ? <Loader2 className="animate-spin" /> : <BadgeCheck />} {lead.status === "convertido" ? "Já convertido" : "Converter em cliente"}
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>Status</Label>
                  <Select value={lead.status} onValueChange={(v) => update.mutate({ status: v as LeadStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(LEAD_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="next">Próximo contato</Label>
                  <Input id="next" type="date" defaultValue={lead.next_contact_at ?? ""} key={lead.next_contact_at ?? "x"} onBlur={(e) => { const v = e.target.value || null; if (v !== lead.next_contact_at) update.mutate({ next_contact_at: v }); }} />
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Observações</h3>
                <Textarea aria-label="Nova observação" maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Registrar observação…" />
                <Button size="sm" className="mt-2" onClick={() => addNote.mutate()} disabled={addNote.isPending}>{addNote.isPending && <Loader2 className="animate-spin" />} Adicionar observação</Button>
                <ul className="mt-3 grid gap-2">
                  {(notes.data ?? []).map((n) => <li key={n.id} className="rounded-lg border border-border p-3 text-sm"><p className="whitespace-pre-wrap">{n.content}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString("pt-BR")}</p></li>)}
                  {notes.data?.length === 0 && <li className="text-sm text-muted-foreground">Nenhuma observação.</li>}
                </ul>
              </div>
              <div><h3 className="mb-2 font-semibold">Respostas do diagnóstico</h3><AnswersList answers={lead.answers} /></div>
            </div>
            <FollowupDialog open={followOpen} onOpenChange={setFollowOpen} presetLeadId={lead.id} />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium break-words">{value}</p></div>;
}
