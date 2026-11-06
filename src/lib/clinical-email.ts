import type { Consultation } from '../types';
import { formatDate } from './format';

type PrescriptionItem = NonNullable<Consultation['prescriptionItems']>[number];

function hasContent(item: PrescriptionItem) {
  return [item.medication, item.presentation, item.dose, item.frequency, item.route, item.duration, item.quantity, item.instructions]
    .some((value) => Boolean(value && value.trim()));
}

function line(label: string, value: string | null | undefined) {
  const clean = value?.trim();
  return clean ? `${label}: ${clean}` : null;
}

function formatVitals(vitals: Record<string, string> | undefined) {
  if (!vitals) return null;
  const labels: Record<string, string> = {
    pa: 'PA',
    fc: 'FC',
    fr: 'FR',
    temp: 'Temp.',
    spo2: 'SpO₂',
    peso: 'Peso',
    talla: 'Talla',
    glucosa: 'Glucosa'
  };
  const parts = Object.entries(vitals)
    .filter(([, value]) => value && String(value).trim())
    .map(([key, value]) => `${labels[key] ?? key}: ${value}`);
  return parts.length ? parts.join(' · ') : null;
}

function emailLogoUrl() {
  return typeof window === 'undefined' ? '/logo-orthospine.png' : `${window.location.origin}/logo-orthospine.png`;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export function buildPrescriptionEmailBody(input: {
  clinicName: string;
  consultation: Consultation;
  items?: PrescriptionItem[];
  legacyText?: string;
  timezone?: string;
}) {
  const { consultation } = input;
  const timezone = input.timezone ?? 'America/Managua';
  const lines = [
    'ORTHO SPINE CENTER',
    `Logo: ${emailLogoUrl()}`,
    input.clinicName || 'Clínica',
    `Paciente: ${consultation.patientName} · Expediente: ${consultation.recordNumber}`,
    `Fecha: ${formatDate(consultation.consultedAt, timezone, { day: '2-digit', month: 'long', year: 'numeric' })}`,
    `Médico: ${consultation.professionalName}`,
    ''
  ];

  const items = (input.items ?? consultation.prescriptionItems ?? []).filter(hasContent);
  if (items.length) {
    items.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.medication}${item.presentation ? ` — ${item.presentation}` : ''}`);
      const details = [
        item.dose && `Dosis: ${item.dose}`,
        item.frequency && `Frecuencia: ${item.frequency}`,
        item.route && `Vía: ${item.route}`,
        item.duration && `Duración: ${item.duration}`,
        item.quantity && `Cantidad: ${item.quantity}`
      ].filter(Boolean);
      if (details.length) lines.push(details.join(' · '));
      if (item.instructions) lines.push(`Indicaciones: ${item.instructions}`);
      lines.push('');
    });
  } else if (input.legacyText?.trim()) {
    lines.push(input.legacyText.trim(), '');
  } else {
    lines.push('Sin medicamentos registrados.', '');
  }

  lines.push('Firma y sello del médico', consultation.professionalName);
  return lines.join('\n');
}

export function buildEvolutionEmailBody(input: {
  clinicName: string;
  consultation: Consultation;
  timezone?: string;
}) {
  const { consultation } = input;
  const timezone = input.timezone ?? 'America/Managua';
  const sections = [
    line('Motivo de consulta', consultation.reason),
    line('Enfermedad actual', consultation.currentIllness),
    line('Signos vitales', formatVitals(consultation.vitals)),
    line('Examen físico', consultation.physicalExam),
    line('Examen funcional', consultation.functionalExam),
    line('Estudios', consultation.studies),
    line('Plan de tratamiento', consultation.treatmentPlan),
    line('Evolución', consultation.evolution),
    line('Plan / seguimiento', consultation.plan),
    line('Próxima visita', consultation.nextVisitAt ? formatDate(consultation.nextVisitAt, timezone) : null)
  ].filter((value): value is string => Boolean(value));

  return [
    'ORTHO SPINE CENTER',
    `Logo: ${emailLogoUrl()}`,
    input.clinicName || 'Clínica',
    `Paciente: ${consultation.patientName} · Expediente: ${consultation.recordNumber}`,
    `Fecha: ${formatDate(consultation.consultedAt, timezone, { day: '2-digit', month: 'long', year: 'numeric' })}`,
    `Médico: ${consultation.professionalName}`,
    '',
    ...sections,
    '',
    'Firma y sello del médico',
    consultation.professionalName
  ].join('\n');
}

/** HTML counterpart for a sender that supports rich email; mailto drafts use the text bodies above. */
export function buildClinicalEmailHtml(input: { clinicName: string; patientName: string; recordNumber: string; professionalName: string; date: string; title: string; content: string }) {
  return `<!doctype html><html lang="es"><meta charset="utf-8"><body style="margin:0;background:#f4f8f7;font-family:Arial,sans-serif;color:#17202b"><main style="max-width:640px;margin:24px auto;background:#fff;padding:28px;border-radius:12px"><header style="border-bottom:3px solid #0f766e;padding-bottom:18px;margin-bottom:20px"><img src="${escapeHtml(emailLogoUrl())}" alt="ORTHO SPINE CENTER" style="display:block;width:auto;height:64px;max-width:220px;object-fit:contain;margin-bottom:12px"><h1 style="margin:0;color:#0f766e;font-size:22px">${escapeHtml(input.clinicName)}</h1><p style="margin:6px 0 0;color:#52616b">${escapeHtml(input.title)}</p></header><p><strong>Paciente:</strong> ${escapeHtml(input.patientName)}<br><strong>Expediente:</strong> ${escapeHtml(input.recordNumber)}<br><strong>Fecha:</strong> ${escapeHtml(input.date)}<br><strong>Médico:</strong> ${escapeHtml(input.professionalName)}</p><div style="white-space:pre-wrap;line-height:1.6">${escapeHtml(input.content)}</div><footer style="border-top:1px solid #dce7e5;margin-top:28px;padding-top:16px;text-align:center;color:#52616b">Firma y sello del médico<br><strong>${escapeHtml(input.professionalName)}</strong></footer></main></body></html>`;
}

export function buildPrescriptionEmailHtml(input: { clinicName: string; consultation: Consultation; items?: PrescriptionItem[]; legacyText?: string; timezone?: string }) {
  const body = buildPrescriptionEmailBody(input);
  return buildClinicalEmailHtml({
    clinicName: input.clinicName,
    patientName: input.consultation.patientName,
    recordNumber: input.consultation.recordNumber,
    professionalName: input.consultation.professionalName,
    date: formatDate(input.consultation.consultedAt, input.timezone ?? 'America/Managua', { day: '2-digit', month: 'long', year: 'numeric' }),
    title: 'Récipe médico',
    content: body.split('\n').slice(5, -2).join('\n').trim()
  });
}

export function buildEvolutionEmailHtml(input: { clinicName: string; consultation: Consultation; timezone?: string }) {
  const body = buildEvolutionEmailBody(input);
  return buildClinicalEmailHtml({
    clinicName: input.clinicName,
    patientName: input.consultation.patientName,
    recordNumber: input.consultation.recordNumber,
    professionalName: input.consultation.professionalName,
    date: formatDate(input.consultation.consultedAt, input.timezone ?? 'America/Managua', { day: '2-digit', month: 'long', year: 'numeric' }),
    title: 'Nota médica / evolución',
    content: body.split('\n').slice(5, -2).join('\n').trim()
  });
}

export function buildMailtoUrl(input: { to: string; subject: string; body: string }) {
  return `mailto:${encodeURIComponent(input.to.trim())}?subject=${encodeURIComponent(input.subject)}&body=${encodeURIComponent(input.body)}`;
}
