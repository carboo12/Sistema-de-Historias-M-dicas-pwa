import { useState } from 'react';
import { ArrowRight, BookOpenCheck, CalendarDays, ClipboardList, FilePenLine, FileSearch, Keyboard, Lightbulb, Plus, Printer, UserRoundSearch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

const processFlows = {
  ingreso: { label: 'Ingreso', title: 'Registrar y atender', intro: 'Del alta del paciente a una consulta documentada.', steps: [
    { title: 'Registra al paciente', text: 'Busca primero por nombre o expediente para evitar duplicados. Si no existe, crea su ficha demográfica.', icon: UserRoundSearch, link: '/pacientes', action: 'Abrir pacientes' },
    { title: 'Abre su expediente', text: 'Revisa antecedentes, alergias, citas y consultas previas antes de iniciar la atención.', icon: FileSearch, link: '/pacientes', action: 'Buscar expediente' },
    { title: 'Crea la consulta', text: 'Selecciona paciente y profesional; registra motivo, evolución y examen.', icon: Plus, link: '/consultas/nueva', action: 'Nueva consulta' },
    { title: 'Completa el plan', text: 'Añade diagnósticos, estudios y medicamentos en sus secciones. Imprime la receta de forma independiente.', icon: Printer, link: '/consultas', action: 'Ver consultas' }
  ] },
  actualizacion: { label: 'Actualización', title: 'Corregir y completar', intro: 'Mantén al día la ficha y la documentación clínica.', steps: [
    { title: 'Edita datos demográficos', text: 'Abre el expediente y usa Editar para corregir contacto, dirección u otros datos de la ficha.', icon: UserRoundSearch, link: '/pacientes', action: 'Abrir pacientes' },
    { title: 'Actualiza la evolución', text: 'Entra en la consulta correspondiente y modifica la nota, examen o plan mientras el registro permita edición.', icon: FilePenLine, link: '/consultas', action: 'Ver consultas' },
    { title: 'Modifica receta o estudios', text: 'Edita cada medicamento estructurado y sus instrucciones; ajusta estudios en su pestaña para que queden localizables.', icon: ClipboardList, link: '/consultas', action: 'Ver consultas' },
    { title: 'Reprograma una cita', text: 'Desde Agenda abre la cita y actualiza horario, motivo o estado; verifica que el cambio quede guardado.', icon: CalendarDays, link: '/agenda', action: 'Abrir agenda' }
  ] },
  eliminacion: { label: 'Eliminación', title: 'Retirar registros con cuidado', intro: 'Confirma siempre el registro y su relación antes de borrarlo.', steps: [
    { title: 'Identifica el registro', text: 'Busca por paciente, fecha y expediente. Comprueba que sea el elemento duplicado o incorrecto.', icon: FileSearch, link: '/pacientes', action: 'Buscar registro' },
    { title: 'Elige la acción adecuada', text: 'Cancela citas que no ocurrieron; elimina un diagnóstico duplicado desde la consulta. Evita borrar información clínica válida.', icon: CalendarDays, link: '/agenda', action: 'Abrir agenda' },
    { title: 'Revisa la confirmación', text: 'Lee el diálogo con atención antes de confirmar. La eliminación puede no ser reversible y puede afectar el historial.', icon: FilePenLine, link: '/consultas', action: 'Ver consultas' },
    { title: 'Verifica el expediente', text: 'Vuelve a consultar la ficha y la lista relacionada para comprobar que la corrección quedó reflejada.', icon: BookOpenCheck, link: '/pacientes', action: 'Verificar paciente' }
  ] }
} as const;

const quickSteps = [
  { number: '01', title: 'Encuentra o registra al paciente', description: 'Busca por nombre o número de expediente; revisa el historial o crea una ficha nueva.', icon: UserRoundSearch },
  { number: '02', title: 'Abre una consulta', description: 'Usa Nueva consulta o inicia desde una cita. Confirma paciente y profesional.', icon: ClipboardList },
  { number: '03', title: 'Completa las secciones clínicas', description: 'En Evolución redacta la nota y el plan; en Estudios registra solicitudes y resultados.', icon: BookOpenCheck },
  { number: '04', title: 'Prepara e imprime la receta', description: 'Agrega medicamento, dosis, frecuencia, duración e indicaciones. La impresión incluye solo la receta.', icon: Printer }
];

export function HelpPage() {
  const [activeFlow, setActiveFlow] = useState<keyof typeof processFlows>('ingreso');
  const flow = processFlows[activeFlow];
  return <div className="mx-auto max-w-6xl space-y-7">
    <header className="flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100"><BookOpenCheck className="h-5 w-5" /></span><div><p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-teal-700/60">Guía rápida</p><h2 className="mt-1 font-display text-3xl font-medium tracking-tight text-ink">Ayuda y soporte</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/55">Recorridos de trabajo y orientación para expedientes, consultas y recetas.</p></div></header>

    <section className="card p-5 sm:p-7"><div className="mb-5"><p className="eyebrow">Mapa de procesos</p><h3 className="mt-1 font-display text-2xl font-medium text-ink">Flujos de trabajo</h3><p className="mt-1 text-sm text-ink/50">Selecciona un proceso para ver el recorrido recomendado.</p></div>
      <div className="no-print mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Procesos del sistema">{(Object.keys(processFlows) as (keyof typeof processFlows)[]).map((key) => <Button key={key} role="tab" aria-selected={activeFlow === key} variant={activeFlow === key ? 'primary' : 'secondary'} onClick={() => setActiveFlow(key)}>{processFlows[key].label}</Button>)}</div>
      <div role="tabpanel" aria-label={flow.label}><h4 className="font-bold text-ink">{flow.title}</h4><p className="mt-1 text-sm text-ink/50">{flow.intro}</p><div className="mt-5 grid gap-3 lg:grid-cols-4">{flow.steps.map((step, index) => <article key={step.title} className="relative rounded-2xl border border-line/70 bg-white p-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><step.icon className="h-5 w-5" /></span><span className="text-[10px] font-extrabold tracking-widest text-teal-700/55">PASO 0{index + 1}</span></div><h5 className="mt-3 text-sm font-bold text-ink">{step.title}</h5><p className="mt-1 min-h-[4.5rem] text-xs leading-relaxed text-ink/55">{step.text}</p><Link className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-teal-800 hover:text-teal-600" to={step.link}>{step.action}<ArrowRight className="h-3.5 w-3.5" /></Link>{index < flow.steps.length - 1 ? <ArrowRight className="no-print absolute -right-3 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 rounded-full bg-white p-0.5 text-teal-500 lg:block" /> : null}</article>)}</div></div>
    </section>

    <section className="grid gap-4 md:grid-cols-2">{quickSteps.map((step) => <article key={step.number} className="card flex gap-4 p-5 sm:p-6"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-canvas text-teal-800"><step.icon className="h-5 w-5" /></span><div><p className="text-[10px] font-extrabold tracking-[0.18em] text-teal-700/60">PASO {step.number}</p><h3 className="mt-1 font-bold text-ink">{step.title}</h3><p className="mt-2 text-sm leading-relaxed text-ink/55">{step.description}</p></div></article>)}</section>

    <section className="card p-5 sm:p-7"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Lightbulb className="h-5 w-5" /></span><div><h3 className="font-bold text-ink">Consejos para el expediente</h3><p className="mt-0.5 text-xs text-ink/45">Mantén la información clara y fácil de consultar.</p></div></div><ul className="mt-5 grid gap-3 text-sm leading-relaxed text-ink/65 sm:grid-cols-2"><li className="rounded-xl bg-canvas/70 p-4">Usa Evolución para documentar el encuentro y el seguimiento del paciente.</li><li className="rounded-xl bg-canvas/70 p-4">Registra resultados y solicitudes en Estudios clínicos junto a la consulta.</li><li className="rounded-xl bg-canvas/70 p-4">La receta se imprime de forma independiente; no hace falta imprimir toda la consulta.</li><li className="rounded-xl bg-canvas/70 p-4">Verifica paciente, dosis, frecuencia y duración antes de imprimir o firmar.</li></ul></section>

    <section className="card-muted flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="flex items-start gap-3"><Keyboard className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" /><div><h3 className="text-sm font-bold text-ink">Atajos y navegación</h3><p className="mt-1 text-sm leading-relaxed text-ink/55">Usa el menú lateral en computadora o la barra inferior en móvil. Los campos admiten los atajos habituales como Ctrl/Cmd + C y Ctrl/Cmd + V.</p></div></div><Link to="/pacientes" className="btn btn-secondary shrink-0"><FileSearch className="h-4 w-4" />Ir a pacientes</Link></section>
  </div>;
}
