import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { api } from '../lib/api';
import { useDebouncedValue } from '../lib/hooks';
import { ageFromBirthDate, patientDocument } from '../lib/format';
import type { Patient } from '../types';
import { Avatar, Input, Spinner } from './ui';

export function PatientPicker({
  value,
  onChange,
  placeholder = 'Buscar por nombre, cédula o historia…',
  autoFocus = false
}: {
  value: Patient | null;
  onChange: (patient: Patient | null) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const debounced = useDebouncedValue(search, 250);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isFetching } = useQuery({
    queryKey: ['patient-picker', debounced],
    queryFn: () => api.patients.list(debounced, 8, 0),
    enabled: !value && (debounced.length > 0 || open)
  });

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (value) {
    const age = ageFromBirthDate(value.birthDate);
    return (
      <div className="flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50/60 p-3">
        <Avatar name={value.fullName} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">{value.fullName}</p>
          <p className="truncate text-xs text-ink/50">
            {value.recordNumber} · {patientDocument(value)}
            {age !== null ? ` · ${age} años` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setSearch('');
            setOpen(true);
          }}
          className="focus-ring rounded-lg p-2 text-ink/40 hover:bg-white hover:text-ink"
          aria-label="Cambiar paciente"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
        <Input
          className="pl-10 pr-10"
          value={search}
          autoFocus={autoFocus}
          placeholder={placeholder}
          onChange={(event) => {
            setSearch(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {isFetching ? <Spinner className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" /> : null}
      </div>

      {open ? (
        <div className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-line bg-surface p-1.5 shadow-lift">
          {data?.patients.length ? (
            data.patients.map((patient) => {
              const age = ageFromBirthDate(patient.birthDate);
              return (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => {
                    onChange(patient);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-teal-50"
                >
                  <Avatar name={patient.fullName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{patient.fullName}</p>
                    <p className="truncate text-[11px] text-ink/45">
                      {patient.recordNumber} · {patientDocument(patient)}
                      {age !== null ? ` · ${age} años` : ''}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <p className="px-3 py-6 text-center text-sm text-ink/45">
              {isFetching ? 'Buscando…' : search ? 'Sin coincidencias' : 'Escribe para buscar un paciente'}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
