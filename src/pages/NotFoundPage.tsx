import { Link } from 'react-router-dom';
import { ArrowLeft, HeartPulse } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-6">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-teal-100/60 blur-3xl" />
      <div className="relative max-w-md text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-900 text-teal-200 shadow-xl shadow-teal-900/20">
          <HeartPulse className="h-8 w-8" />
        </span>
        <p className="mt-8 text-[11px] font-extrabold uppercase tracking-[0.2em] text-teal-700/60">Error 404</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-ink">Esta página no existe</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/50">
          Puede que el enlace haya cambiado o que la historia que buscas ya no esté disponible.
        </p>
        <Link
          to="/agenda"
          className="btn btn-primary mt-7 inline-flex"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la agenda
        </Link>
      </div>
    </div>
  );
}
