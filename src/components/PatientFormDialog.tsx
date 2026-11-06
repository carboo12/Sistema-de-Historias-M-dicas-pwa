import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { api, ApiError } from '../lib/data';
import type { Patient } from '../types';
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
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['patients'] }),
        queryClient.invalidateQueries({ queryKey: ['patient', patient?.id] })
      ]);
      onCreated?.(response.patient);
      onClose();
    },
      onError: (cause) => setError(cause instanceof ApiError ? cause.message : 'No se pudo guardar el paciente')
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
