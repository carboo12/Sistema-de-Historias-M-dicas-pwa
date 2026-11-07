import type { Consultation } from '../types';
import { formatDate, formatDateOnly } from './format';

const OFFICIAL_DOCTOR = 'Dr. Jhaxel Ameed García Rizo';

export function openClinicalPrintWindow() {
  const target = window.open('', '_blank', 'width=900,height=900');
  if (target) target.opener = null;
  return target;
}

export const openPrescriptionPrintWindow = openClinicalPrintWindow;

interface ClinicalTextPrintInput {
  patientName: string;
  consultedAt: string;
  nextVisitAt?: string | null;
  timezone?: string;
  sectionTitle: string;
  content?: string;
  sections?: Array<{ title: string; content: string }>;
  logoUrl?: string;
}

interface PrescriptionPrintInput {
  clinicName: string;
  patientName: string;
  recordNumber: string;
  consultedAt: string;
  professionalName: string;
  items: NonNullable<Consultation['prescriptionItems']>;
  legacyText?: string;
  patientDocument?: string | null;
  patientBirthDate?: string | null;
  timezone?: string;
  logoUrl?: string;
  nextVisitAt?: string | null;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function hasContent(item: NonNullable<Consultation['prescriptionItems']>[number]) {
  return [item.medication, item.presentation, item.dose, item.frequency, item.route, item.duration, item.quantity, item.instructions]
    .some((value) => Boolean(value && value.trim()));
}

export function renderClinicalTextPrint(target: Window, input: ClinicalTextPrintInput) {
  const doc = target.document;
  const timezone = input.timezone ?? 'America/Managua';
  const patientName = escapeHtml(input.patientName);
  const date = escapeHtml(formatDate(input.consultedAt, timezone, {
    day: '2-digit', month: 'long', year: 'numeric'
  }));
  const nextVisit = input.nextVisitAt
    ? escapeHtml(formatDateOnly(input.nextVisitAt))
    : '__________';
  const logoUrl = escapeHtml(input.logoUrl ?? `${window.location.origin}/logo-orthospine.png`);
  const content = input.sections?.length
    ? input.sections.map((section) => `<section class="clinical-section"><h2>${escapeHtml(section.title)}</h2><div class="content">${escapeHtml(section.content.trim() || 'Sin información registrada.')}</div></section>`).join('')
    : `<div class="content">${escapeHtml(input.content?.trim() || ' ')}</div>`;

  doc.open();
  doc.write(`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(input.sectionTitle)} · ${patientName}</title>
<style>
  @page { size: letter; margin: 10mm 12mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; min-height: 100%; }
  body { color: #252525; font-family: Arial, Helvetica, sans-serif; font-size: 11pt; line-height: 1.4; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .sheet { min-height: 259mm; display: flex; flex-direction: column; }
  .header { display: grid; grid-template-columns: 42mm 1fr; align-items: center; gap: 7mm; min-height: 39mm; }
  .logo { display: block; width: 42mm; height: auto; object-fit: contain; }
  .doctor { text-align: center; }
  .doctor-name { color: #333; font-family: "Segoe Script", "Brush Script MT", "URW Chancery L", cursive; font-size: 19pt; font-style: italic; font-weight: 500; line-height: 1.2; margin: 0 0 1.5mm; }
  .specialty { font-size: 9.2pt; font-weight: 700; line-height: 1.25; margin: 0; }
  .subspecialty { font-size: 8.2pt; line-height: 1.25; margin: 2mm 0 0; }
  .training { font-size: 7.4pt; line-height: 1.2; margin: .5mm 0 0; }
  .patient-row { align-items: baseline; border-bottom: .35mm solid #444; display: grid; grid-template-columns: 1fr 47mm; gap: 5mm; margin-top: 8mm; min-height: 12mm; padding-bottom: 1.5mm; }
  .patient-field, .date-field { display: flex; align-items: baseline; gap: 2mm; min-width: 0; }
  .field-label { flex: none; font-size: 9pt; }
  .field-value { font-size: 10pt; font-weight: 600; overflow-wrap: anywhere; }
  .main { flex: 1; min-height: 125mm; padding: 7mm 2mm; background-image: url("${escapeHtml(`${window.location.origin}/drx9000-watermark.png`)}"); background-position: center; background-repeat: no-repeat; background-size: 148mm auto; }
  .section-title { color: #555; font-size: 8.5pt; font-weight: 700; letter-spacing: .08em; margin: 0 0 4mm; text-transform: uppercase; }
  .content { font-size: 11pt; line-height: 1.45; min-height: 70mm; white-space: pre-wrap; overflow-wrap: anywhere; }
  .clinical-section { margin: 0 0 8mm; }
  .clinical-section h2 { border-bottom: .25mm solid #bbb; color: #555; font-size: 9pt; letter-spacing: .06em; margin: 0 0 3mm; padding-bottom: 1.5mm; text-transform: uppercase; break-after: avoid; page-break-after: avoid; }
  .clinical-section .content { min-height: 0; }
  .print-footer { align-items: flex-end; display: grid; grid-template-columns: 1fr 72mm; gap: 8mm; margin-top: auto; min-height: 32mm; break-inside: avoid; page-break-inside: avoid; }
  .contact { font-size: 8.2pt; line-height: 1.32; }
  .next-visit { align-items: baseline; display: flex; gap: 2mm; margin-bottom: 2mm; }
  .next-label { font-weight: 600; }
  .next-value { border-bottom: .3mm solid #555; flex: 1; min-height: 5mm; padding-left: 1mm; }
  .contact p { margin: .5mm 0; }
  .signature { padding-bottom: 1mm; text-align: center; }
  .signature-space { height: 22mm; }
  .signature-line { border-top: .35mm solid #444; padding-top: 2mm; }
  .signature-name { font-family: "Segoe Script", "Brush Script MT", "URW Chancery L", cursive; font-size: 12pt; font-style: italic; margin: 0; }
  @media print {
    .sheet { min-height: 259mm; }
    .print-footer { break-inside: avoid; page-break-inside: avoid; }
  }
</style>
</head>
<body>
  <article class="sheet">
    <header class="header">
      <img class="logo" src="${logoUrl}" alt="ORTHO SPINE CENTER">
      <div class="doctor">
        <h1 class="doctor-name">${OFFICIAL_DOCTOR}</h1>
        <p class="specialty">Cirujano de Columna Vertebral<br>Ortopedista y Traumatólogo</p>
        <p class="subspecialty">Cirugía Mínimamente Invasiva de Columna / Alta Especialidad en Cirugía de Columna Vertebral</p>
        <p class="training">(INR / MÉXICO, STANFORD UNIVERSITY, / UMASS MEMORIAL MEDICAL CENTER, USA)</p>
      </div>
    </header>

    <section class="patient-row" aria-label="Datos del paciente">
      <div class="patient-field"><span class="field-label">Paciente:</span><span class="field-value">${patientName}</span></div>
      <div class="date-field"><span class="field-label">Fecha:</span><span class="field-value">${date}</span></div>
    </section>

    <main class="main">
      ${input.sections?.length ? content : `<h2 class="section-title">${escapeHtml(input.sectionTitle)}</h2>${content}`}
    </main>

    <footer class="print-footer">
      <div class="contact">
        <div class="next-visit"><span class="next-label">Próxima cita:</span><span class="next-value">${nextVisit}</span></div>
        <p>Dirección: Semáforos de Plaza el Sol 1c. al Sur y 1 c. abajo, Los Robles.</p>
        <p>Managua - Nicaragua. Tels.: 22524048 • 85464804</p>
        <p>www.orthospinecenternicaragua.com</p>
        <p>clinica@orthospinecenternicaragua.com</p>
      </div>
      <div class="signature">
        <div class="signature-space"></div>
        <div class="signature-line"><p class="signature-name">${OFFICIAL_DOCTOR}</p></div>
      </div>
    </footer>
  </article>
</body>
</html>`);

  doc.close();
  let printed = false;
  const printWhenReady = () => {
    if (printed) return;
    printed = true;
    target.focus();
    target.print();
  };
  const logo = doc.querySelector<HTMLImageElement>('.logo');
  if (logo && !logo.complete) {
    logo.addEventListener('load', printWhenReady, { once: true });
    logo.addEventListener('error', printWhenReady, { once: true });
    window.setTimeout(printWhenReady, 1200);
  } else {
    window.setTimeout(printWhenReady, 200);
  }
}

export function renderPrescriptionPrint(target: Window, input: PrescriptionPrintInput) {
  const itemsText = input.items.filter(hasContent).map((item) => [
    item.medication,
    item.presentation && `Presentación: ${item.presentation}`,
    item.dose && `Dosis: ${item.dose}`,
    item.frequency && `Frecuencia: ${item.frequency}`,
    item.route && `Vía: ${item.route}`,
    item.duration && `Duración: ${item.duration}`,
    item.quantity && `Cantidad: ${item.quantity}`,
    item.instructions && `Indicaciones: ${item.instructions}`
  ].filter(Boolean).join('\n')).join('\n\n');

  renderClinicalTextPrint(target, {
    patientName: input.patientName,
    consultedAt: input.consultedAt,
    nextVisitAt: input.nextVisitAt,
    timezone: input.timezone,
    sectionTitle: 'Receta médica',
    content: input.legacyText?.trim() || itemsText,
    logoUrl: input.logoUrl
  });
}
