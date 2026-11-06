import { formatDate } from './format';

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

export function printConsultation(input: { clinicName: string; patientName: string; recordNumber: string; professionalName: string; consultedAt: string; timezone: string; evolutionText: string; studiesText: string; prescriptionText: string; logoUrl?: string }) {
  const target = window.open('', '_blank', 'width=900,height=900');
  if (!target) return false;
  target.opener = null;
  const sections = [
    ['Evolución / Nota médica', input.evolutionText],
    ['Estudios clínicos', input.studiesText],
    ['Receta de medicamentos', input.prescriptionText]
  ].map(([title, content]) => `<section><h2>${escapeHtml(title)}</h2><p>${escapeHtml(content || 'Sin información registrada.')}</p></section>`).join('');
  const logoUrl = escapeHtml(input.logoUrl ?? `${window.location.origin}/logo-orthospine.png`);
  target.document.write(`<!doctype html><html lang="es"><meta charset="utf-8"><title>Consulta clínica · ${escapeHtml(input.patientName)}</title><style>@page{size:A4;margin:18mm}*{box-sizing:border-box}body{font:12pt/1.55 Arial,sans-serif;color:#17202b}header{align-items:center;border-bottom:3px solid #0f766e;padding-bottom:14px;margin-bottom:18px;display:flex;gap:20px}header img{height:64px;max-width:220px;object-fit:contain}h1{margin:0;color:#0f766e;font-size:22pt}header p{margin:6px 0 0;color:#52616b;font-size:10pt}.patient{background:#f1f8f7;padding:12px 16px;margin-bottom:22px}section{margin:0 0 22px;break-inside:avoid}h2{font-size:12pt;color:#0f766e;border-bottom:1px solid #cbdedb;padding-bottom:5px}section p{white-space:pre-wrap;min-height:30px}.signature{margin:65px 0 0 auto;border-top:1px solid #444;width:270px;text-align:center;padding-top:8px;font-size:10pt}</style><body><header><img src="${logoUrl}" alt="ORTHO SPINE CENTER"><div><h1>${escapeHtml(input.clinicName)}</h1><p>Expediente clínico · ${escapeHtml(input.professionalName)}</p></div></header><div class="patient"><strong>Paciente:</strong> ${escapeHtml(input.patientName)}<br><strong>Expediente:</strong> ${escapeHtml(input.recordNumber)}<br><strong>Fecha:</strong> ${escapeHtml(formatDate(input.consultedAt, input.timezone))}</div>${sections}<div class="signature">Firma y sello del médico<br>${escapeHtml(input.professionalName)}</div></body></html>`);
  target.document.close();
  target.onload = () => { target.focus(); target.print(); };
  return true;
}
