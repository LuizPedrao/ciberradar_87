import { Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LEAD_STATUS, type LeadStatus } from "@/lib/admin-api";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-xl border border-border bg-card shadow-card", className)}>{children}</div>;
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground"><Inbox className="h-5 w-5" /></span>
      <p className="mt-3 font-medium">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export function LoadingRows() {
  return <div className="grid gap-2 p-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}</div>;
}

export function ErrorBox() {
  return <p className="p-6 text-sm text-destructive">Não foi possível carregar os dados. Atualize a página.</p>;
}

const STATUS_STYLE: Record<LeadStatus, string> = {
  novo: "bg-chart-5/15 text-chart-5",
  em_contato: "bg-warning/15 text-warning",
  qualificado: "bg-primary/10 text-primary",
  convertido: "bg-success/15 text-success",
  perdido: "bg-muted text-muted-foreground",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <Badge variant="outline" className={cn("border-transparent", STATUS_STYLE[status])}>{LEAD_STATUS[status]}</Badge>;
}

export function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 70 ? "bg-success/15 text-success" : score >= 40 ? "bg-warning/15 text-warning" : "bg-danger/15 text-danger";
  return <span className={cn("inline-flex min-w-10 justify-center rounded-md px-2 py-0.5 text-xs font-semibold", cls)}>{score}</span>;
}
