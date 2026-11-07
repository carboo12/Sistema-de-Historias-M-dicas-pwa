import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { api, ApiError } from '../lib/data';
import type { Patient, PatientDetail } from '../types';
import { Button, Field, Input, Modal, Select, Textarea } from './ui';
import { ageFromBirthDate } from '../lib/format';
import { patientFormSchema } from '../lib/form-validation';

export function PatientFormDialog({
  open,
  onClose,
  onCreated,
  patient = null
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (patient: Patient) => void;
  patient?: Patient | null;
}) {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState('');
  const [ageManuallyEdited, setAgeManuallyEdited] = useState(false);
  const [sex, setSex] = useState('U');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [conditions, setConditions] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFullName(patient?.fullName ?? '');
    setDocumentType(patient?.documentType ?? '');
    setDocumentNumber(patient?.documentNumber ?? '');
    setBirthDate(patient?.birthDate?.slice(0, 10) ?? '');
    setAge(String(patient?.ageOverride ?? ageFromBirthDate(patient?.birthDate ?? null) ?? ''));
    setAgeManuallyEdited(patient?.ageOverride != null);
    setSex(patient?.sex ?? 'U');
    setPhone(patient?.phone ?? '');
    setEmail(patient?.email ?? '');
    setConditions(patient?.currentDiagnosisSummary ?? '');
    setError(null);
  }, [open, patient]);

  const mutation = useMutation({
    mutationFn: (payload: ReturnType<typeof patientFormSchema.parse>) => {
      return patient ? api.patients.update(patient.id, payload) : api.patients.create(payload);
    },
    onMutate: async (payload) => {
      if (!patient) return { snapshots: [], detailSnapshot: undefined as PatientDetail | undefined };
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['patients'] }),
        queryClient.cancelQueries({ queryKey: ['patient', patient.id] })
      ]);
      const snapshots = queryClient.getQueriesData<{ patients: Patient[]; total: number; limit?: number; offset?: number }>({ queryKey: ['patients'] });
      const detailSnapshot = queryClient.getQueryData<PatientDetail>(['patient', patient.id]);
      const words = String(payload.fullName ?? '').trim().split(/\s+/);
      const optimistic: Patient = {
        ...patient,
        ...payload,
        firstName: words[0] ?? '',
        lastName: words.slice(1).join(' ') || null,
        phone: payload.phone || null,
        mobile: payload.phone || null,
        email: payload.email || null,
        birthDate: payload.birthDate || null,
        ageOverride: payload.ageOverride == null ? null : Number(payload.ageOverride),
        documentType: payload.documentType || null,
        documentNumber: payload.documentNumber || null,
        currentDiagnosisSummary: payload.currentDiagnosisSummary || null,
        updatedAt: new Date().toISOString()
      };
      const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
      const text = normalize([optimistic.fullName, optimistic.documentNumber, optimistic.recordNumber].filter(Boolean).join(' '));
      for (const [queryKey, cached] of snapshots) {
        if (!cached) continue;
        const search = normalize(String(queryKey[1] ?? '').trim());
        const matches = !search || search.split(/\s+/).every((word) => text.includes(word));
        const exists = cached.patients.some((item) => item.id === patient.id);
        if (!exists) continue;
        queryClient.setQueryData(queryKey, matches
          ? { ...cached, patients: cached.patients.map((item) => item.id === patient.id ? optimistic : item) }
          : { ...cached, patients: cached.patients.filter((item) => item.id !== patient.id), total: Math.max(0, cached.total - 1) });
      }
      if (detailSnapshot) queryClient.setQueryData<PatientDetail>(['patient', patient.id], { ...detailSnapshot, patient: optimistic });
      return { snapshots, detailSnapshot };
    },
    onSuccess: (response) => {
      const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
      const patientText = normalize([
        response.patient.fullName,
        response.patient.documentNumber,
        response.patient.recordNumber
      ].filter(Boolean).join(' '));
      for (const [queryKey, current] of queryClient.getQueriesData<{ patients: Patient[]; total: number; limit?: number; offset?: number }>({ queryKey: ['patients'] })) {
        if (!current) continue;
        const search = normalize(String(queryKey[1] ?? '').trim());
        const matches = !search || search.split(/\s+/).every((term) => patientText.includes(term));
        const existingIndex = current.patients.findIndex((item) => item.id === response.patient.id);
        const editing = Boolean(patient);
        if (existingIndex >= 0 && !matches) {
          queryClient.setQueryData(queryKey, {
            ...current,
            patients: current.patients.filter((item) => item.id !== response.patient.id),
            total: Math.max(0, current.total - 1)
          });
          continue;
        }
        if (existingIndex >= 0 && matches) {
          const updated = current.patients.map((item) => item.id === response.patient.id ? response.patient : item)
            .sort((a, b) => a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' }));
          queryClient.setQueryData(queryKey, { ...current, patients: updated });
          continue;
        }
        if (!editing && matches && Number(current.offset ?? queryKey[2] ?? 0) === 0) {
          const limit = current.limit ?? 15;
          const patients = [...current.patients, response.patient]
            .sort((a, b) => a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' }))
            .slice(0, limit);
          queryClient.setQueryData(queryKey, { ...current, patients, total: current.total + 1 });
        }
      }
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['patients'] }),
        queryClient.invalidateQueries({ queryKey: ['patient', response.patient.id] }),
        queryClient.invalidateQueries({ queryKey: ['reports'] }),
        queryClient.invalidateQueries({ queryKey: ['summary'] })
      ]);
      onCreated?.(response.patient);
      onClose();
    },
    onError: (cause, _payload, context) => {
      for (const [queryKey, cached] of context?.snapshots ?? []) queryClient.setQueryData(queryKey, cached);
      if (patient && context?.detailSnapshot) queryClient.setQueryData(['patient', patient.id], context.detailSnapshot);
      console.error('Error al guardar el paciente:', cause);
      setError(cause instanceof ApiError ? cause.message : cause instanceof Error ? cause.message : 'No se pudo guardar el paciente');
    }
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = patientFormSchema.safeParse({
      fullName, documentType, documentNumber, birthDate, ageOverride: ageManuallyEdited ? age : '',
      sex, phone, email, currentDiagnosisSummary: conditions
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisa los datos del paciente');
      return;
    }
    mutation.mutate(parsed.data);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={patient ? 'Editar paciente' : 'Nuevo paciente'}
      description={patient ? 'Actualiza los datos de identificación y contacto.' : 'Crea la ficha base. Podrás completar el resto del expediente después.'}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="patient-form" loading={mutation.isPending} icon={<UserPlus className="h-4 w-4" />}>
            {patient ? 'Guardar cambios' : 'Crear paciente'}
          </Button>
        </>
      }
    >
      <form id="patient-form" className="space-y-4" onSubmit={onSubmit}>
        <Field label="Nombre completo" required>
          <Input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Nombre y apellidos"
            autoFocus
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tipo de documento">
            <Select value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
              <option value="">Sin especificar</option>
              <option value="cedula">Cédula</option>
              <option value="pasaporte">Pasaporte</option>
              <option value="ruc">RUC</option>
              <option value="nit">NIT</option>
              <option value="ssn">SSN</option>
              <option value="sin_documento">Sin documento</option>
              <option value="otro">Otro</option>
            </Select>
          </Field>
          <Field label="Número de documento">
            <Input
              value={documentNumber}
              onChange={(event) => setDocumentNumber(event.target.value)}
              placeholder="Ej. 001-120488-0001A"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fecha de nacimiento">
            <Input type="date" value={birthDate} onChange={(event) => {
              const value = event.target.value;
              setBirthDate(value);
              setAge(String(ageFromBirthDate(value || null) ?? ''));
              setAgeManuallyEdited(false);
            }} />
          </Field>
          <Field label="Edad" hint="Se calcula con la fecha de nacimiento; puedes ajustarla manualmente.">
            <Input type="number" min={0} max={150} step={1} value={age} onChange={(event) => {
              setAge(event.target.value);
              setAgeManuallyEdited(true);
            }} placeholder="Años" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sexo">
            <Select value={sex} onChange={(event) => setSex(event.target.value)}>
              <option value="U">Sin especificar</option>
              <option value="F">Femenino</option>
              <option value="M">Masculino</option>
              <option value="X">Otro</option>
            </Select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Teléfono">
            <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+505 8888 0000" />
          </Field>
          <Field label="Correo electrónico">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="paciente@correo.com"
            />
          </Field>
        </div>

        <Field label="Enfermedades / antecedentes" hint="Enfermedades crónicas, antecedentes o condiciones relevantes">
          <Textarea
            value={conditions}
            onChange={(event) => setConditions(event.target.value)}
            placeholder="Enfermedades crónicas, antecedentes o condiciones relevantes"
            className="min-h-20"
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
