import type { Consultation } from '../types';
import { formatDate, formatDateOnly } from './format';

export function openPrescriptionPrintWindow() {
  const target = window.open('', '_blank', 'width=900,height=760');
  if (target) target.opener = null;
  return target;
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

export function renderPrescriptionPrint(target: Window, input: PrescriptionPrintInput) {
  const doc = target.document;
  const timezone = input.timezone ?? 'America/Managua';
  const items = input.items.filter(hasContent);
  const clinicName = escapeHtml(input.clinicName || 'Clínica');
  const patientName = escapeHtml(input.patientName);
  const professionalName = escapeHtml(input.professionalName);
  const patientDocument = input.patientDocument ? escapeHtml(input.patientDocument) : '';
  const birthDate = input.patientBirthDate ? escapeHtml(formatDateOnly(input.patientBirthDate)) : '';
  const date = escapeHtml(formatDate(input.consultedAt, timezone, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }));
    const logoUrl = escapeHtml(input.logoUrl ?? `${window.location.origin}/logo-orthospine.png`);

  const itemsHtml = items.length
    ? items.map((item, index) => {
      const details = [
        item.presentation && `<span><span class="label">Presentación:</span> ${escapeHtml(item.presentation)}</span>`,
        item.dose && `<span><span class="label">Dosis:</span> ${escapeHtml(item.dose)}</span>`,
        item.frequency && `<span><span class="label">Frecuencia:</span> ${escapeHtml(item.frequency)}</span>`,
        item.route && `<span><span class="label">Vía:</span> ${escapeHtml(item.route)}</span>`,
        item.duration && `<span><span class="label">Duración:</span> ${escapeHtml(item.duration)}</span>`,
        item.quantity && `<span><span class="label">Cantidad:</span> ${escapeHtml(item.quantity)}</span>`
      ].filter(Boolean).join('');
      return `<li class="item">
        <h2>${index + 1}. ${escapeHtml(item.medication || 'Medicamento')}</h2>
        ${details ? `<p class="meta-line">${details}</p>` : ''}
        ${item.instructions ? `<p class="instructions"><span class="label">Indicaciones:</span> ${escapeHtml(item.instructions)}</p>` : ''}
      </li>`;
    }).join('')
    : `<li class="empty">${input.legacyText ? `<span class="legacy">${escapeHtml(input.legacyText)}</span>` : 'Sin medicamentos registrados.'}</li>`;

  doc.open();
  doc.write(`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Receta médica · ${patientName}</title>
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body {
    color: #111827;
    font-family: "Segoe UI", Arial, Helvetica, sans-serif;
    font-size: 14px;
    line-height: 1.45;
    margin: 24px auto;
    max-width: 800px;
    padding: 0 28px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  header {
    align-items: flex-start;
    border-bottom: 3px solid #0f766e;
    display: flex;
    gap: 24px;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 16px;
  }
  .clinic h1 { color: #0f766e; font-size: 22px; letter-spacing: .02em; margin: 0; }
  .brand { align-items: center; display: flex; gap: 14px; }
  .brand img { display: block; height: 58px; max-width: 190px; object-fit: contain; }
  .subtitle { color: #64748b; font-size: 10px; letter-spacing: .18em; margin: 5px 0 0; text-transform: uppercase; }
  .doctor { color: #475569; font-size: 11px; text-align: right; }
  .doctor strong { color: #111827; display: block; font-size: 14px; }
  .patient {
    background: #f4faf9;
    border: 1px solid #d7ece8;
    border-radius: 10px;
    display: grid;
    gap: 14px 24px;
    grid-template-columns: 1.35fr 1fr;
    margin-bottom: 22px;
    padding: 12px 14px;
  }
  dl { margin: 0; }
  dt { color: #64748b; font-size: 9.5px; letter-spacing: .08em; text-transform: uppercase; }
  dd { font-size: 12.5px; font-weight: 600; margin: 1px 0 7px; }
  dd:last-child { margin-bottom: 0; }
  .items { list-style: none; margin: 0; padding: 0; }
  .item {
    border: 1px solid #e2e8e7;
    border-radius: 10px;
    break-inside: avoid;
    margin-bottom: 10px;
    padding: 12px 14px;
  }
  .item h2 { color: #0f766e; font-size: 14px; margin: 0 0 6px; }
  .item p { margin: 4px 0 0; }
  .meta-line { color: #475569; display: flex; flex-wrap: wrap; font-size: 12px; gap: 4px 16px; }
  .label { color: #334155; font-weight: 700; }
  .instructions { font-size: 12.5px; }
  .empty { border: 1px dashed #cbd5e1; border-radius: 10px; color: #64748b; padding: 16px; }
  .legacy { white-space: pre-wrap; }
  .signature { break-inside: avoid; display: flex; justify-content: flex-end; margin-top: 64px; }
  .signature .box { border-top: 1px solid #334155; color: #64748b; font-size: 11px; padding-top: 8px; text-align: center; width: 280px; }
  .signature .box strong { color: #111827; display: block; font-size: 13px; }
  footer { border-top: 1px solid #e2e8e7; color: #94a3b8; font-size: 9.5px; margin-top: 26px; padding-top: 10px; text-align: center; }
  @media print {
    body { margin: 0 auto; max-width: none; padding: 0; }
  }
</style>
</head>
<body>
  <header>
    <div class="brand"><img src="${logoUrl}" alt="ORTHO SPINE CENTER"><div class="clinic">
      <h1>${clinicName}</h1>
      <p class="subtitle">Récipe médico</p>
    </div></div>
    <div class="doctor">
      <strong>${professionalName}</strong>
      <span>Médico tratante</span>
    </div>
  </header>

  <section class="patient">
    <dl>
      <dt>Paciente</dt>
      <dd>${patientName}</dd>
      <dt>Expediente</dt>
      <dd>${escapeHtml(input.recordNumber)}</dd>
    </dl>
    <dl>
      <dt>Fecha</dt>
      <dd>${date}</dd>
      ${patientDocument ? `<dt>Documento</dt><dd>${patientDocument}</dd>` : ''}
      ${birthDate ? `<dt>Fecha de nacimiento</dt><dd>${birthDate}</dd>` : ''}
    </dl>
  </section>

  <ul class="items">${itemsHtml}</ul>

  <div class="signature">
    <div class="box">
      <strong>${professionalName}</strong>
      Firma y sello del médico
    </div>
  </div>

  <footer>Documento generado desde la historia clínica electrónica · ${clinicName}</footer>
</body>
</html>`);
  doc.close();

  window.setTimeout(() => {
    target.focus();
    target.print();
  }, 150);
}
