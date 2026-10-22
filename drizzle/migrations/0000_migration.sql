
create type public.app_role as enum ('admin');
create type public.lead_status as enum ('novo','em_contato','qualificado','convertido','perdido');
create type public.client_status as enum ('ativo','inativo','pausado');
create type public.deliverable_status as enum ('pendente','em_andamento','concluido');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select public.has_role(auth.uid(), 'admin') $$;
revoke execute on function public.is_admin() from anon, public;
grant execute on function public.is_admin() to authenticated;

create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public
as $$ begin new.updated_at = now(); return new; end $$;

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique,
  name text not null check (char_length(name) between 2 and 120),
  company text not null check (char_length(company) between 2 and 120),
  whatsapp text not null check (whatsapp ~ '^[0-9]{10,13}$'),
  email text check (email is null or char_length(email) <= 254),
  company_size text not null check (company_size in ('1-5','6-20','21-50','51-100','100+')),
  main_concern text check (main_concern is null or char_length(main_concern) <= 500),
  score int not null check (score between 0 and 100),
  classification text not null,
  answers jsonb not null,
  status public.lead_status not null default 'novo',
  next_contact_at date,
  consent_contact_at timestamptz not null,
  consent_marketing boolean not null default false,
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index leads_created_idx on public.leads(created_at desc);
create index leads_status_idx on public.leads(status);
create index leads_source_idx on public.leads(source_hash, created_at);
grant select, update, delete on public.leads to authenticated;
grant all on public.leads to service_role;
alter table public.leads enable row level security;
create policy "admin read leads" on public.leads for select to authenticated using (public.is_admin());
create policy "admin update leads" on public.leads for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete leads" on public.leads for delete to authenticated using (public.is_admin());
create trigger leads_touch before update on public.leads for each row execute function public.touch_updated_at();

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid unique references public.leads(id) on delete set null,
  name text not null check (char_length(name) between 2 and 120),
  company text not null check (char_length(company) between 2 and 120),
  whatsapp text check (whatsapp is null or whatsapp ~ '^[0-9]{10,13}$'),
  email text check (email is null or char_length(email) <= 254),
  status public.client_status not null default 'ativo',
  service_interest text check (service_interest is null or char_length(service_interest) <= 200),
  notes text check (notes is null or char_length(notes) <= 2000),
  converted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index clients_company_whatsapp_uniq on public.clients(lower(company), whatsapp) where whatsapp is not null;
grant select, insert, update, delete on public.clients to authenticated;
grant all on public.clients to service_role;
alter table public.clients enable row level security;
create policy "admin all clients" on public.clients for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger clients_touch before update on public.clients for each row execute function public.touch_updated_at();

create table public.followups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 160),
  description text check (description is null or char_length(description) <= 1000),
  due_date date not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);
create index followups_due_idx on public.followups(completed, due_date);
grant select, insert, update, delete on public.followups to authenticated;
grant all on public.followups to service_role;
alter table public.followups enable row level security;
create policy "admin all followups" on public.followups for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  type text not null check (char_length(type) between 2 and 120),
  description text check (description is null or char_length(description) <= 1000),
  due_date date,
  status public.deliverable_status not null default 'pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.deliverables to authenticated;
grant all on public.deliverables to service_role;
alter table public.deliverables enable row level security;
create policy "admin all deliverables" on public.deliverables for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger deliverables_touch before update on public.deliverables for each row execute function public.touch_updated_at();

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  author_id uuid not null default auth.uid(),
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index lead_notes_lead_idx on public.lead_notes(lead_id, created_at desc);
grant select, insert, delete on public.lead_notes to authenticated;
grant all on public.lead_notes to service_role;
alter table public.lead_notes enable row level security;
create policy "admin read notes" on public.lead_notes for select to authenticated using (public.is_admin());
create policy "admin insert notes" on public.lead_notes for insert to authenticated with check (public.is_admin() and author_id = auth.uid());
create policy "admin delete notes" on public.lead_notes for delete to authenticated using (public.is_admin());

create table public.app_settings (
  id int primary key default 1 check (id = 1),
  whatsapp_number text check (whatsapp_number is null or whatsapp_number ~ '^[0-9]{10,15}$'),
  contact_email text check (contact_email is null or char_length(contact_email) <= 254),
  updated_at timestamptz not null default now()
);
insert into public.app_settings (id) values (1);
grant select, update on public.app_settings to authenticated;
grant all on public.app_settings to service_role;
alter table public.app_settings enable row level security;
create policy "admin read settings" on public.app_settings for select to authenticated using (public.is_admin());
create policy "admin update settings" on public.app_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger settings_touch before update on public.app_settings for each row execute function public.touch_updated_at();

create or replace function public.get_public_settings()
returns table (whatsapp_number text, contact_email text)
language sql stable security definer set search_path = public
as $$ select whatsapp_number, contact_email from public.app_settings where id = 1 $$;
grant execute on function public.get_public_settings() to anon, authenticated;

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  created_at timestamptz not null default now()
);
create index activity_created_idx on public.activity_log(created_at desc);
grant select, insert on public.activity_log to authenticated;
grant all on public.activity_log to service_role;
alter table public.activity_log enable row level security;
create policy "admin read log" on public.activity_log for select to authenticated using (public.is_admin());
create policy "admin insert log" on public.activity_log for insert to authenticated with check (public.is_admin() and actor_id = auth.uid());

create or replace function public.convert_lead_to_client(_lead_id uuid)
returns uuid language plpgsql security definer set search_path = public
as $$
declare l public.leads; cid uuid;
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  select * into l from public.leads where id = _lead_id;
  if not found then raise exception 'lead not found'; end if;
  select id into cid from public.clients where lead_id = _lead_id;
  if cid is null then
    select id into cid from public.clients where lower(company) = lower(l.company) and whatsapp = l.whatsapp;
  end if;
  if cid is null then
    insert into public.clients (lead_id, name, company, whatsapp, email, notes)
    values (l.id, l.name, l.company, l.whatsapp, l.email, l.main_concern) returning id into cid;
  end if;
  update public.leads set status = 'convertido' where id = _lead_id;
  insert into public.activity_log (actor_id, action, entity_type, entity_id) values (auth.uid(), 'convert_lead', 'lead', _lead_id);
  return cid;
end $$;
revoke execute on function public.convert_lead_to_client(uuid) from anon, public;
grant execute on function public.convert_lead_to_client(uuid) to authenticated;
