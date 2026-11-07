import { openClinicalPrintWindow, renderClinicalTextPrint } from './prescription-print';

export function printConsultation(input: {
  clinicName: string;
  patientName: string;
  recordNumber: string;
  professionalName: string;
  consultedAt: string;
  nextVisitAt?: string | null;
  timezone: string;
  evolutionText: string;
  studiesText: string;
  prescriptionText: string;
  logoUrl?: string;
}) {
  const target = openClinicalPrintWindow();
  if (!target) return false;

  renderClinicalTextPrint(target, {
    patientName: input.patientName,
    consultedAt: input.consultedAt,
    timezone: input.timezone,
    nextVisitAt: input.nextVisitAt,
    sectionTitle: 'Consulta completa',
    logoUrl: input.logoUrl,
    sections: [
      { title: 'Evolución / Nota médica', content: input.evolutionText },
      { title: 'Estudios clínicos', content: input.studiesText },
      { title: 'Receta de medicamentos', content: input.prescriptionText }
    ]
  });
  return true;
}
