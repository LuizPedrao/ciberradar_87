import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Followup = Database["public"]["Tables"]["followups"]["Row"];
export type Deliverable = Database["public"]["Tables"]["deliverables"]["Row"];
export type LeadNote = Database["public"]["Tables"]["lead_notes"]["Row"];
export type LeadStatus = Database["public"]["Enums"]["lead_status"];
export type ClientStatus = Database["public"]["Enums"]["client_status"];
export type DeliverableStatus = Database["public"]["Enums"]["deliverable_status"];

export const LEAD_STATUS: Record<LeadStatus, string> = {
  novo: "Novo",
  em_contato: "Em contato",
  qualificado: "Qualificado",
  convertido: "Convertido",
  perdido: "Perdido",
};
export const CLIENT_STATUS: Record<ClientStatus, string> = { ativo: "Ativo", pausado: "Pausado", inativo: "Inativo" };
export const DELIVERABLE_STATUS: Record<DeliverableStatus, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluido: "Concluído",
};
export const DELIVERABLE_TYPES: [string, ...string[]] = ["Reunião de orientação", "Plano inicial de melhorias", "Checklist de segurança", "Relatório orientativo"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function unwrap<R extends { data: any; error: any }>(res: R): NonNullable<R["data"]> {
  if (res.error || res.data == null) throw new Error("Não foi possível concluir a operação.");
  return res.data;
}

export async function logActivity(action: string, entity_type: string, entity_id?: string) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("activity_log").insert({ actor_id: data.user.id, action, entity_type, entity_id: entity_id ?? null });
}

export function fmtDate(v: string | null | undefined): string {
  if (!v) return "—";
  const d = v.length === 10 ? new Date(`${v}T12:00:00`) : new Date(v);
  return d.toLocaleDateString("pt-BR");
}

export function todayISO(): string {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export const qk = {
  leads: ["admin", "leads"] as const,
  clients: ["admin", "clients"] as const,
  followups: ["admin", "followups"] as const,
  deliverables: ["admin", "deliverables"] as const,
  notes: (id: string) => ["admin", "notes", id] as const,
  settings: ["admin", "settings"] as const,
};

export const fetchers = {
  leads: async () => unwrap(await supabase.from("leads").select("*").order("created_at", { ascending: false })),
  clients: async () => unwrap(await supabase.from("clients").select("*").order("converted_at", { ascending: false })),
  followups: async () => unwrap(await supabase.from("followups").select("*").order("due_date")),
  deliverables: async () => unwrap(await supabase.from("deliverables").select("*").order("created_at", { ascending: false })),
};
