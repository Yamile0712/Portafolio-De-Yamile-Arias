-- Pega esto en Supabase > SQL Editor > New query > Run

create table if not exists public.reviews (
  id         bigint generated always as identity primary key,
  name       text not null check (char_length(name) between 1 and 80),
  project    text check (project is null or char_length(project) <= 100),
  rating     int  not null check (rating between 1 and 5),
  comment    text not null check (char_length(comment) between 1 and 1200),
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

grant select, insert on public.reviews to anon;

-- Cualquier visitante puede LEER las reseñas
create policy "Leer reseñas"
  on public.reviews for select to anon using (true);

-- Cualquier visitante puede DEJAR una reseña (no editar ni borrar)
create policy "Dejar reseñas"
  on public.reviews for insert to anon with check (true);
