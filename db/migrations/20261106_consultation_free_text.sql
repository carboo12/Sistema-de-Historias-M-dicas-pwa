-- Free-text clinical sheet fields. Nullable to preserve legacy consultations.
ALTER TABLE public.consultations
  ADD COLUMN IF NOT EXISTS evolution_text text,
  ADD COLUMN IF NOT EXISTS studies_text text,
  ADD COLUMN IF NOT EXISTS prescription_text text;
