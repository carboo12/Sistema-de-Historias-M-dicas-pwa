-- Vincula usuarios clínicos con Firebase Authentication.
-- Ejecutar una sola vez sobre la base administrada por Data Connect.

alter table public.users
  add column if not exists firebase_uid text;

create unique index if not exists users_firebase_uid_uq
  on public.users (firebase_uid)
  where firebase_uid is not null;

create index if not exists users_email_link_idx
  on public.users (lower(email))
  where firebase_uid is null and email is not null;

comment on column public.users.firebase_uid is
  'UID de Firebase Authentication. Se enlaza por correo verificado en el primer inicio de sesión.';

alter table public.consultation_diagnoses
  add column if not exists created_by uuid references public.users(id) on delete set null;
