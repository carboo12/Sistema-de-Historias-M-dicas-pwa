import { z } from 'zod';

export const patientFormSchema = z.object({
  fullName: z.string().trim().min(1, 'El nombre completo es obligatorio').max(240),
  documentType: z.enum(['cedula', 'pasaporte', 'ruc', 'nit', 'ssn', 'sin_documento', 'otro']).or(z.literal('')).nullable().optional().transform((value) => value || null),
  documentNumber: z.string().trim().max(60).optional().transform((value) => value || null),
  birthDate: z.string().optional().transform((value) => value || null),
  ageOverride: z.string().optional().transform((value) => value === '' || value === undefined ? null : Number(value)).pipe(z.number().int().min(0, 'La edad no puede ser negativa').max(150, 'La edad debe ser menor de 150 años').nullable()),
  sex: z.enum(['U', 'F', 'M', 'X']),
  phone: z.string().max(40),
  email: z.union([z.literal(''), z.email()]),
  currentDiagnosisSummary: z.string().max(4000)
});

export const appointmentFormSchema = z.object({
  patientId: z.string().min(1, 'Selecciona un paciente'),
  professionalId: z.string().min(1, 'Selecciona un profesional'),
  date: z.iso.date('Indica una fecha válida'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Indica una hora válida'),
  durationMinutes: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1, 'La duración debe ser mayor que cero').max(480, 'La duración no puede exceder 8 horas')),
  reason: z.string().max(500),
  notes: z.string().max(2000)
});
