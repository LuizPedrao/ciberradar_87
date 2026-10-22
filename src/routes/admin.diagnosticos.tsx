import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Panel, EmptyState, LoadingRows, ErrorBox, ScoreBadge } from "@/components/admin/ui";
import { AnswersList } from "@/components/admin/AnswersList";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchers, fmtDate, qk, type Lead } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/diagnosticos")({ component: Diagnosticos });

function Diagnosticos() {
  const leads = useQuery({ queryKey: qk.leads, queryFn: fetchers.leads });
  const [sel, setSel] = useState<Lead | null>(null);
  return (
    <>
      <PageHeader title="Diagnósticos" description="Avaliações vinculadas a leads que solicitaram contato." />
      <Panel className="overflow-hidden">
        {leads.isLoading ? <LoadingRows /> : leads.isError ? <ErrorBox /> : !leads.data?.length ? <EmptyState title="Nenhum diagnóstico com contato" /> : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Empresa</TableHead><TableHead>Pontuação</TableHead><TableHead>Classificação</TableHead><TableHead>Data</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {leads.data.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.company}</TableCell>
                    <TableCell><ScoreBadge score={l.score} /></TableCell>
                    <TableCell>{l.classification}</TableCell>
                    <TableCell>{fmtDate(l.created_at)}</TableCell>
                    <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => setSel(l)}>Ver respostas</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>
      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {sel && (<>
            <DialogHeader><DialogTitle>{sel.company}</DialogTitle><DialogDescription>{sel.score}/100 · {sel.classification} · {fmtDate(sel.created_at)}</DialogDescription></DialogHeader>
            <AnswersList answers={sel.answers} />
          </>)}
        </DialogContent>
      </Dialog>
    </>
  );
}
