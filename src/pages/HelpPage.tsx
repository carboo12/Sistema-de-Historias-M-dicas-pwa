import {
  BookOpenCheck,
  ClipboardList,
  FileSearch,
  Keyboard,
  Lightbulb,
  Printer,
  UserRoundSearch
} from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    number: '01',
    title: 'Encuentra o registra al paciente',
    description: 'Abre Pacientes para buscar por nombre o número de expediente. Desde ahí puedes revisar antecedentes y consultas anteriores o crear una ficha nueva.',
    icon: UserRoundSearch
  },
  {
    number: '02',
    title: 'Abre una consulta',
    description: 'Usa Nueva consulta o inicia desde una cita. Confirma el paciente, profesional y tipo de atención antes de continuar.',
    icon: ClipboardList
  },
  {
    number: '03',
    title: 'Completa las secciones clínicas',
    description: 'En Evolución redacta la nota médica, examen, diagnóstico y plan. En Estudios registra estudios complementarios e información relacionada.',
    icon: BookOpenCheck
  },
  {
    number: '04',
    title: 'Prepara e imprime la receta',
    description: 'Abre Receta de medicamentos, agrega cada medicamento con dosis, frecuencia, duración e indicaciones y pulsa Imprimir receta. La vista de impresión muestra solo la receta.',
    icon: Printer
  }
];

export function HelpPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100">
          <BookOpenCheck className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-teal-700/60">Guía rápida</p>
          <h2 className="mt-1 font-display text-3xl font-medium tracking-tight text-ink">Ayuda y soporte</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/55">Un recorrido breve para trabajar con expedientes, consultas y recetas.</p>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {steps.map((step) => (
          <article key={step.number} className="card flex gap-4 p-5 sm:p-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-canvas text-teal-800">
              <step.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-extrabold tracking-[0.18em] text-teal-700/60">PASO {step.number}</p>
              <h3 className="mt-1 font-bold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/55">{step.description}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="card p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Lightbulb className="h-5 w-5" /></span>
          <div><h3 className="font-bold text-ink">Consejos para el expediente</h3><p className="mt-0.5 text-xs text-ink/45">Mantén la información clara y fácil de consultar.</p></div>
        </div>
        <ul className="mt-5 grid gap-3 text-sm leading-relaxed text-ink/65 sm:grid-cols-2">
          <li className="rounded-xl bg-canvas/70 p-4">Usa Evolución para documentar el encuentro y el seguimiento del paciente.</li>
          <li className="rounded-xl bg-canvas/70 p-4">Registra resultados y solicitudes en Estudios clínicos para encontrarlos junto a la consulta.</li>
          <li className="rounded-xl bg-canvas/70 p-4">La receta se imprime de forma independiente; no es necesario imprimir toda la consulta.</li>
          <li className="rounded-xl bg-canvas/70 p-4">Verifica paciente, dosis, frecuencia y duración antes de imprimir o firmar.</li>
        </ul>
      </section>

      <section className="card-muted flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <Keyboard className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
          <div><h3 className="text-sm font-bold text-ink">Atajos y navegación</h3><p className="mt-1 text-sm leading-relaxed text-ink/55">Usa el menú lateral en computadora o la barra inferior en móvil para cambiar de sección. Los campos de texto admiten los atajos habituales del navegador, como Ctrl/Cmd + C y Ctrl/Cmd + V.</p></div>
        </div>
        <Link to="/pacientes" className="btn btn-secondary shrink-0"><FileSearch className="h-4 w-4" />Ir a pacientes</Link>
      </section>
    </div>
  );
}
