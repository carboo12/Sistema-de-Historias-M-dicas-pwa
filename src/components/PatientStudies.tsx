import { useRef, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Expand, FileImage, FileText, Loader2, Printer, RotateCw, Upload, ZoomIn, ZoomOut } from 'lucide-react';
import { Button, ErrorState, Field, Input, Modal, Select, Textarea } from './ui';
import { firebaseApi } from '../services/firebase/api';
import { useFirebaseBackend } from '../services/firebase/client';
import { isSupportedStudyFile, MAX_STUDY_FILE_SIZE } from '../services/firebase/study-storage';
import type { PatientStudy } from '../types';

const studyCategories = [
  { value: 'imagenologia', label: 'Imagenología' },
  { value: 'laboratorio', label: 'Laboratorio' },
  { value: 'cardiologia', label: 'Cardiología' },
  { value: 'otro', label: 'Otro' }
];

function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function displayDate(value: string) {
  return new Date(value).toLocaleDateString('es-NI', { dateStyle: 'medium' });
}

function isImage(study: PatientStudy) {
  return study.mimeType.startsWith('image/');
}

export function PatientStudies({ patientId }: { patientId: string }) {
  const queryClient = useQueryClient();
  const [studyName, setStudyName] = useState('');
  const [studyType, setStudyType] = useState('imagenologia');
  const [performedAt, setPerformedAt] = useState(localDate());
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [activeStudy, setActiveStudy] = useState<PatientStudy | null>(null);
  const studies = useQuery({ queryKey: ['patient-studies', patientId], queryFn: () => firebaseApi.studies.list(patientId), enabled: Boolean(patientId && useFirebaseBackend) });
  const upload = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('Selecciona un archivo para continuar.');
      return firebaseApi.studies.create({ patientId, studyName: studyName.trim(), studyType, performedAt, note: note.trim(), file });
    },
    onSuccess: async () => {
      setStudyName(''); setNote(''); setFile(null); setPerformedAt(localDate());
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['patient-studies', patientId] }),
        queryClient.invalidateQueries({ queryKey: ['patient', patientId] }),
      ]);
    }
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);
    if (!studyName.trim()) return setValidationError('Indica el tipo o nombre del estudio.');
    if (!file) return setValidationError('Selecciona una imagen, DICOM o PDF.');
    if (!isSupportedStudyFile(file)) return setValidationError('Formato no admitido. Usa JPG, PNG, WebP, DICOM o PDF.');
    if (file.size > MAX_STUDY_FILE_SIZE) return setValidationError('El archivo supera el límite de 50 MB.');
    upload.mutate();
  }

  return <>
    <section className="card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Imágenes y documentos</p><h3 className="mt-1 font-display text-xl font-medium text-ink">Estudios adjuntos</h3><p className="mt-1 text-xs leading-relaxed text-ink/50">Radiografías, ecografías, resonancias, DICOM y documentos PDF.</p></div><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><FileImage className="h-5 w-5" /></span></div>
      {!useFirebaseBackend ? <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Configura Firebase Auth, Storage y Data Connect para habilitar los adjuntos clínicos.</p> : null}
      {useFirebaseBackend ? <form className="no-print mt-5 grid gap-4 rounded-2xl border border-line/70 bg-canvas/40 p-4 sm:grid-cols-2" onSubmit={submit}>
        <Field label="Nombre del estudio" required><Input value={studyName} onChange={(event) => setStudyName(event.target.value)} placeholder="Radiografía de tórax AP" maxLength={180} /></Field>
        <Field label="Categoría"><Select value={studyType} onChange={(event) => setStudyType(event.target.value)}>{studyCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select></Field>
        <Field label="Fecha del estudio"><Input type="date" value={performedAt} onChange={(event) => setPerformedAt(event.target.value)} required /></Field>
        <Field label="Archivo" hint="JPG, PNG, WebP, DICOM o PDF · máximo 50 MB"><Input type="file" accept="image/jpeg,image/png,image/webp,application/pdf,application/dicom,.dcm,.dicom" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-teal-800" /></Field>
        <div className="sm:col-span-2"><Field label="Nota médica"><Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Hallazgos o indicaciones relacionadas…" maxLength={3000} className="min-h-20" /></Field></div>
        {validationError || upload.error ? <p className="sm:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">{validationError ?? (upload.error instanceof Error ? upload.error.message : 'No se pudo guardar el archivo.')}</p> : null}
        <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3"><p className="text-[11px] text-ink/45">Se conserva el archivo original y se genera una miniatura ligera para la galería.</p><Button type="submit" loading={upload.isPending} icon={upload.isPending ? undefined : <Upload className="h-4 w-4" />}>{upload.isPending ? 'Subiendo…' : 'Adjuntar estudio'}</Button></div>
      </form> : null}
      {studies.isLoading ? <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink/45"><Loader2 className="h-4 w-4 animate-spin" />Cargando estudios…</div> : null}
      {studies.isError ? <div className="mt-4"><ErrorState message="No se pudieron cargar los estudios adjuntos." onRetry={() => void studies.refetch()} /></div> : null}
      {studies.data?.studies.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{studies.data.studies.map((study) => <button key={study.id} type="button" onClick={() => setActiveStudy(study)} className="group overflow-hidden rounded-2xl border border-line/70 bg-white text-left transition hover:border-teal-300 hover:shadow-soft"><span className="flex aspect-[16/10] items-center justify-center overflow-hidden bg-slate-950/5">{isImage(study) ? <img src={study.previewUrl ?? study.fileUrl} alt={`Miniatura: ${study.studyName}`} loading="lazy" className="h-full w-full object-contain transition group-hover:scale-[1.02]" /> : <span className="flex flex-col items-center gap-2 text-teal-800">{study.mimeType === 'application/pdf' ? <FileText className="h-10 w-10" /> : <FileImage className="h-10 w-10" />}<span className="text-xs font-bold">{study.mimeType === 'application/pdf' ? 'Documento PDF' : 'Estudio DICOM'}</span></span>}</span><span className="block p-3.5"><span className="block truncate text-sm font-bold text-ink">{study.studyName}</span><span className="mt-1 block text-xs text-ink/45">{displayDate(study.performedAt)}{study.professionalName ? ` · ${study.professionalName}` : ''}</span>{study.resultText ? <span className="mt-2 line-clamp-2 block text-xs leading-relaxed text-ink/55">{study.resultText}</span> : null}</span></button>)}</div> : null}
      {studies.data && studies.data.studies.length === 0 ? <p className="mt-5 rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-ink/45">Aún no hay imágenes ni documentos adjuntos en este expediente.</p> : null}
    </section>
    <StudyLightbox study={activeStudy} onClose={() => setActiveStudy(null)} />
  </>;
}

function StudyLightbox({ study, onClose }: { study: PatientStudy | null; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const close = () => { setZoom(1); setRotation(0); onClose(); };
  const fullscreen = async () => { try { await panelRef.current?.requestFullscreen(); } catch { /* Fullscreen can be unavailable in embedded browsers. */ } };
  const printImage = () => {
    if (!study) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.opener = null;
    win.document.title = study.studyName;
    const style = win.document.createElement('style');
    style.textContent = 'body{margin:0;display:grid;place-items:center;min-height:100vh}img{max-width:100vw;max-height:95vh;object-fit:contain}@media print{body{min-height:0}img{max-width:100%;max-height:95vh}}';
    const image = win.document.createElement('img');
    image.src = study.fileUrl; image.alt = study.studyName;
    win.document.head.append(style); win.document.body.append(image);
    image.onload = () => win.print();
  };
  return <Modal open={Boolean(study)} onClose={close} title={study?.studyName ?? 'Visor de estudio'} description={study ? `${displayDate(study.performedAt)} · ${study.fileName}` : undefined} size="lg">
    {study ? <div ref={panelRef} className="space-y-4">
      <div className="no-print flex flex-wrap items-center gap-2 rounded-xl bg-canvas p-2">
        {isImage(study) ? <><Button size="sm" variant="secondary" icon={<ZoomOut className="h-4 w-4" />} onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))}>Alejar</Button><Button size="sm" variant="secondary" icon={<ZoomIn className="h-4 w-4" />} onClick={() => setZoom((value) => Math.min(4, value + 0.25))}>Acercar</Button><span className="px-2 text-xs text-ink/50">{Math.round(zoom * 100)}%</span><Button size="sm" variant="secondary" icon={<RotateCw className="h-4 w-4" />} onClick={() => setRotation((value) => value + 90)}>Rotar</Button><Button size="sm" variant="secondary" icon={<Expand className="h-4 w-4" />} onClick={() => void fullscreen()}>Pantalla completa</Button><Button size="sm" variant="secondary" icon={<Printer className="h-4 w-4" />} onClick={printImage}>Imprimir</Button></> : <a className="btn btn-secondary btn-sm" href={study.fileUrl} target="_blank" rel="noreferrer" download><Download className="h-4 w-4" />Abrir / descargar archivo</a>}
      </div>
      <div className="max-h-[65vh] min-h-64 overflow-auto rounded-2xl bg-slate-950/95 p-3 text-center">
        {isImage(study) ? <img src={study.fileUrl} alt={study.studyName} className="mx-auto max-h-[60vh] max-w-full object-contain transition-transform" style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }} /> : study.mimeType === 'application/pdf' ? <iframe title={study.studyName} src={study.fileUrl} className="h-[60vh] w-full bg-white" /> : <div className="flex h-64 flex-col items-center justify-center gap-4 text-white/80"><FileImage className="h-12 w-12" /><p className="max-w-md text-sm">Este archivo DICOM no puede visualizarse en el navegador sin un visor especializado. Descárgalo para abrirlo en una estación compatible.</p><a href={study.fileUrl} target="_blank" rel="noreferrer" download className="btn btn-secondary"><Download className="h-4 w-4" />Descargar DICOM</a></div>}
      </div>
      {study.resultText ? <div className="rounded-xl bg-canvas p-4"><p className="text-[10px] font-extrabold uppercase tracking-widest text-ink/40">Nota médica</p><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink/75">{study.resultText}</p></div> : null}
      <p className="text-[11px] leading-relaxed text-ink/40">El visor facilita la consulta visual y no sustituye la interpretación diagnóstica profesional.</p>
    </div> : null}
  </Modal>;
}
