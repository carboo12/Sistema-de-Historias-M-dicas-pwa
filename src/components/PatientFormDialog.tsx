import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { api, ApiError } from '../lib/data';
import type { Patient } from '../types';
import { Button, Field, Input, Modal, Select, Textarea } from './ui';

export function PatientFormDialog({
  open,
  onClose,
  onCreated
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (patient: Patient) => void;
}) {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState('');
  const [documentType, setDocumentType] = useState('cedula');
  const [documentNumber, setDocumentNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [sex, setSex] = useState('U');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [allergies, setAllergies] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFullName('');
    setDocumentType('cedula');
    setDocumentNumber('');
    setBirthDate('');
    setSex('U');
    setPhone('');
    setEmail('');
    setAllergies('');
    setError(null);
  }, [open]);

  const mutation = useMutation({
    mutationFn: () =>
      api.patients.create({
        fullName,
        documentType,
        documentNumber,
        birthDate: birthDate || null,
        sex,
        phone,
        email,
        allergiesNotes: allergies
      }),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['patients'] });
      onCreated?.(response.patient);
      onClose();
    },
    onError: (cause) => setError(cause instanceof ApiError ? cause.message : 'No se pudo crear el paciente')
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!fullName.trim()) {
      setError('El nombre completo es obligatorio');
      return;
    }
    mutation.mutate();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo paciente"
      description="Crea la ficha base. Podrás completar el resto del expediente después."
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="patient-form" loading={mutation.isPending} icon={<UserPlus className="h-4 w-4" />}>
            Crear paciente
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
            <Input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
          </Field>
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

        <Field label="Alergias conocidas" hint="Medicamentos, alimentos u otras alergias relevantes.">
          <Textarea
            value={allergies}
            onChange={(event) => setAllergies(event.target.value)}
            placeholder="Ej. Penicilina"
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
