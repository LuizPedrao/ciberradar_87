import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, UserPlus, BadgeCheck, Briefcase, ClipboardCheck, BellRing, AlertTriangle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "@tanstack/react-router";
import { PageHeader, Panel, EmptyState, ErrorBox } from "@/components/admin/ui";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchers, qk, todayISO } from "@/lib/admin-api";
import { supabase } from "@/integrations/supabase/client";
import { isValidIntlNumber } from "@/lib/whatsapp";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function monthKey(d: string) { return d.slice(0, 7); }
function monthLabel(k: string) { const [y = "", m = ""] = k.split("-"); return `${m}/${y.slice(2)}`; }
function lastMonths(n: number) {
  const out: string[] = []; const d = new Date(); d.setDate(1);
  for (let i = n - 1; i >= 0; i--) { const x = new Date(d.getFullYear(), d.getMonth() - i, 1); out.push(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`); }
  return out;
}

function Dashboard() {
  const leads = useQuery({ queryKey: qk.leads, queryFn: fetchers.leads });
  const clients = useQuery({ queryKey: qk.clients, queryFn: fetchers.clients });
  const followups = useQuery({ queryKey: qk.followups, queryFn: fetchers.followups });
  const settings = useQuery({ queryKey: qk.settings, queryFn: async () => (await supabase.from("app_settings").select("*").eq("id", 1).single()).data });

  if (leads.isError || clients.isError || followups.isError) return <ErrorBox />;
  const L = leads.data ?? [], C = clients.data ?? [], F = followups.data ?? [];
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
  const loading = leads.isLoading || clients.isLoading || followups.isLoading;

  const cards = [
    { label: "Total de leads", value: L.length, icon: Users },
    { label: "Novos leads", value: L.filter((l) => l.status === "novo").length, icon: UserPlus, hint: `${L.filter((l) => l.created_at >= weekAgo).length} nos últimos 7 dias` },
    { label: "Leads convertidos", value: L.filter((l) => l.status === "convertido").length, icon: BadgeCheck },
    { label: "Clientes ativos", value: C.filter((c) => c.status === "ativo").length, icon: Briefcase },
    { label: "Diagnósticos com contato", value: L.length, icon: ClipboardCheck },
    { label: "Lembretes pendentes", value: F.filter((f) => !f.completed).length, icon: BellRing, hint: `${F.filter((f) => !f.completed && f.due_date < todayISO()).length} vencidos` },
  ];

  const months = lastMonths(6);
  const perMonth = months.map((m) => ({
    mes: monthLabel(m),
    leads: L.filter((l) => monthKey(l.created_at) === m).length,
    conversoes: C.filter((c) => monthKey(c.converted_at) === m).length,
  }));
  const dist = [
    { name: "Alta necessidade", value: L.filter((l) => l.score < 40).length, color: "var(--danger)" },
    { name: "Em desenvolvimento", value: L.filter((l) => l.score >= 40 && l.score < 70).length, color: "var(--warning)" },
    { name: "Boas práticas", value: L.filter((l) => l.score >= 70).length, color: "var(--brand)" },
  ];

  return (
    <>
      <PageHeader title="Visão geral" description="Indicadores calculados a partir dos dados reais cadastrados." />
      {settings.data && !isValidIntlNumber(settings.data.whatsapp_number) && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p>O WhatsApp comercial ainda não foi configurado — visitantes não verão o botão de conversa. <Link to="/admin/configuracoes" className="font-medium underline">Configurar agora</Link></p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <Panel key={c.label} className="p-5">
            <div className="flex items-center justify-between text-sm text-muted-foreground">{c.label}<c.icon className="h-4 w-4 text-brand" /></div>
            {loading ? <Skeleton className="mt-3 h-8 w-16" /> : <p className="mt-2 font-display text-3xl font-bold">{c.value}</p>}
            {c.hint && !loading && <p className="mt-1 text-xs text-muted-foreground">{c.hint}</p>}
          </Panel>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <h2 className="font-semibold">Leads por mês</h2>
          {L.length === 0 ? <EmptyState title="Sem leads ainda" text="Os gráficos aparecem quando os primeiros leads chegarem." /> : (
            <div className="mt-4 h-60"><ResponsiveContainer><BarChart data={perMonth}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="mes" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip /><Bar dataKey="leads" name="Leads" fill="var(--navy-2)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
          )}
        </Panel>
        <Panel className="p-5">
          <h2 className="font-semibold">Distribuição dos resultados</h2>
          {L.length === 0 ? <EmptyState title="Sem diagnósticos" /> : (
            <div className="mt-4 flex h-60 items-center gap-4">
              <ResponsiveContainer width="60%"><PieChart><Pie data={dist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85}>{dist.map((d) => <Cell key={d.name} fill={d.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
              <ul className="grid gap-2 text-sm">{dist.map((d) => <li key={d.name} className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: d.color }} />{d.name}: <b>{d.value}</b></li>)}</ul>
            </div>
          )}
        </Panel>
        <Panel className="p-5 lg:col-span-2">
          <h2 className="font-semibold">Evolução de conversões</h2>
          {C.length === 0 ? <EmptyState title="Nenhuma conversão ainda" text="Converta um lead em cliente para acompanhar a evolução." /> : (
            <div className="mt-4 h-60"><ResponsiveContainer><LineChart data={perMonth}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="mes" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip /><Line type="monotone" dataKey="conversoes" name="Conversões" stroke="var(--brand)" strokeWidth={2} /></LineChart></ResponsiveContainer></div>
          )}
        </Panel>
      </div>
    </>
  );
}
