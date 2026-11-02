import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarPlus } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { api, ApiError } from '../lib/api';
import { dateTimeToIso, todayInTimeZone } from '../lib/format';
import type { Patient } from '../types';
import { PatientPicker } from './PatientPicker';
import { Button, Field, Input, Modal, Select, Textarea } from './ui';

export function AppointmentDialog({
  open,
  onClose,
  defaultPatient,
  defaultDate,
  onCreated
}: {
  open: boolean;
  onClose: () => void;
  defaultPatient?: Patient | null;
  defaultDate?: string;
  onCreated?: () => void;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const timezone = user?.timezone ?? 'America/Managua';
  const [patient, setPatient] = useState<Patient | null>(defaultPatient ?? null);
  const [professionalId, setProfessionalId] = useState('');
  const [date, setDate] = useState(defaultDate ?? todayInTimeZone(timezone));
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState('30');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const catalogs = useQuery({
    queryKey: ['catalogs'],
    queryFn: api.catalogs,
    enabled: open
  });

  useEffect(() => {
    if (!open) return;
    setPatient(defaultPatient ?? null);
    setDate(defaultDate ?? todayInTimeZone(timezone));
    setTime('09:00');
    setDuration('30');
    setReason('');
    setNotes('');
    setError(null);
  }, [open, defaultPatient, defaultDate, timezone]);

  useEffect(() => {
    if (professionalId) return;
    const preferred = user?.professionalId ?? catalogs.data?.professionals[0]?.id;
    if (preferred) setProfessionalId(preferred);
  }, [professionalId, user?.professionalId, catalogs.data?.professionals]);

  const mutation = useMutation({
    mutationFn: () =>
      api.agenda.create({
        patientId: patient?.id,
        professionalId,
        startsAt: dateTimeToIso(date, time),
        durationMinutes: Number(duration),
        reason,
        notes
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['agenda'] }),
        queryClient.invalidateQueries({ queryKey: ['patient'] }),
        queryClient.invalidateQueries({ queryKey: ['summary'] })
      ]);
      onCreated?.();
      onClose();
    },
    onError: (cause) => setError(cause instanceof ApiError ? cause.message : 'No se pudo agendar la cita')
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!patient) {
      setError('Selecciona un paciente');
      return;
    }
    if (!professionalId) {
      setError('Selecciona un profesional');
      return;
    }
    mutation.mutate();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Agendar nueva cita"
      description="Reserva un espacio en la agenda del profesional."
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="appointment-form"
            loading={mutation.isPending}
            icon={<CalendarPlus className="h-4 w-4" />}
          >
            Agendar cita
          </Button>
        </>
      }
    >
      <form id="appointment-form" className="space-y-4" onSubmit={onSubmit}>
        <Field label="Paciente" required>
          <PatientPicker value={patient} onChange={setPatient} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Profesional" required>
            <Select value={professionalId} onChange={(event) => setProfessionalId(event.target.value)} required>
              <option value="">Seleccionar</option>
              {catalogs.data?.professionals.map((professional) => (
                <option key={professional.id} value={professional.id}>
                  {professional.full_name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Duración">
            <Select value={duration} onChange={(event) => setDuration(event.target.value)}>
              <option value="15">15 minutos</option>
              <option value="30">30 minutos</option>
              <option value="45">45 minutos</option>
              <option value="60">60 minutos</option>
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fecha" required>
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
          </Field>
          <Field label="Hora" required>
            <Input type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
          </Field>
        </div>

        <Field label="Motivo de la cita">
          <Input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Ej. Control de hipertensión"
            maxLength={500}
          />
        </Field>

        <Field label="Notas para recepción">
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Indicaciones, recordatorios o información de contacto…"
            className="min-h-20"
            maxLength={2000}
          />
        </Field>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
