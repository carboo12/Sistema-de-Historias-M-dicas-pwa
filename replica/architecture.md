# Architecture: Historias Médicas PWA (rebuild del núcleo de Historias Médicas Desktop)

## Stack

| layer | choice | why |
| --- | --- | --- |
| web | React 19 + Vite + TypeScript | PWA rápida, ecosistema amplio y el stack ya definido por el usuario. |
| routing / data | TanStack Router + TanStack Query | Rutas tipadas, cache de servidor y estados de carga/error explícitos. |
| styling | Tailwind CSS + Radix/shadcn, tokens vía Stitch | Consistencia visual y accesibilidad; el diseño UI pasa obligatoriamente por StitchMCP. |
| forms | React Hook Form + Zod | Formularios clínicos largos, validación compartida con la API. |
| API | Fastify + TypeScript + Zod | Baja latencia, esquemas tipados y despliegue simple. |
| database | PostgreSQL 16+ | Transacciones, JSONB, trigram, `btree_gist` y constraints de exclusión para agenda. |
| ORM | Prisma + SQL para constraints avanzadas | Migraciones y tipado; las constraints críticas viven en SQL. |
| auth | Sesiones propias, Argon2id, cookie httpOnly | Control total de roles clínicos y aislamiento por clínica. |
| files | S3-compatible (R2, MinIO o S3) | Imágenes y PDFs fuera de la base; URLs firmadas. |
| jobs | pg-boss | Recordatorios y mantenimiento sin agregar Redis. |
| email | Resend o Postmark | Notificaciones transaccionales; opcional en v1. |
| hosting | Docker + PostgreSQL gestionado + object storage | Portable entre Fly.io, Render o VPS. |
| observability | pino + OpenTelemetry + Sentry | Trazas y errores sin registrar datos clínicos. |

No hay pagos, microservicios ni integración PACS en v1.

## Schema

Tablas: 33 en `db/001_schema.sql`; vistas: 9 en `db/004_views.sql`. Reglas de acceso: checks en la capa de datos, siempre con `clinic_id`; RLS opcional cuando el despliegue lo permita.

Núcleo:

```text
clinics
  users, offices, professionals, professional_specialties
  patients
    patient_history, patient_coverages
    appointments
    consultations
      consultation_diagnoses, consultation_procedures
      prescriptions -> prescription_items
      patient_studies, documents, clinical_images
    patient_anamnesis_answers
catalogs: specialties, history_types, consultation_reasons, companies,
          document_types, cie10_codes, medications, anamnesis_items,
          diagnostic_studies, procedures, fee_schedule
support: medical_orders, report_definitions, audit_log, data_quality_issues
```

Constraints que no se negocian:

- `appointments`: `exclude using gist (professional_id with =, tstzrange(starts_at, ends_at, '[)') with &&)` para impedir solapamientos.
- `patients`: único `(clinic_id, record_number)`; documento único parcial cuando no está vacío.
- `patient_history`: único `(patient_id, category, md5(description))`.
- `consultations`: estados `borrador | firmada | anulada`; `signed_at` obligatorio al firmar.
- `audit_log`: solo inserción; sin `update/delete` desde la app.
- Dinero en centavos + moneda; fechas clínicas en `timestamptz` UTC.

## API

Rutas: 44.

| method path | does | who | input | output | flow |
| --- | --- | --- | --- | --- | --- |
| POST `/auth/login` | Inicia sesión | público | email, password | cookie de sesión + usuario | F01 |
| POST `/auth/logout` | Cierra sesión | autenticado | — | 204 | F01 |
| GET `/auth/me` | Usuario, rol y clínica | autenticado | — | sesión | F01 |
| GET `/patients` | Busca pacientes | recepción, médico | q, documento, página | lista paginada | F01 |
| POST `/patients` | Crea paciente | recepción, médico | ficha | paciente | F01 |
| GET `/patients/:id` | Ficha completa | autenticado | — | paciente | F01 |
| PATCH `/patients/:id` | Edita ficha | recepción, médico | campos | paciente | F01 |
| GET `/patients/:id/history` | Línea de tiempo | médico | filtros | eventos | F03 |
| GET `/patients/:id/summary` | Resumen clínico | médico | — | vista `v_patient_summary` | F03 |
| GET `/agenda` | Agenda por rango | recepción, médico | date, professionalId | citas | F02 |
| GET `/appointments` | Lista citas | recepción, médico | filtros | lista | F02 |
| POST `/appointments` | Agenda cita | recepción | paciente, médico, rango | cita | F02 |
| PATCH `/appointments/:id` | Reprograma | recepción | rango, médico | cita | F02 |
| POST `/appointments/:id/status` | Cambia estado | recepción, médico | status | cita | F02 |
| POST `/appointments/:id/cancel` | Cancela | recepción, médico | motivo | cita | F02 |
| GET `/consultations` | Lista consultas | médico | paciente, fecha | lista | F03 |
| POST `/consultations` | Abre borrador | médico | paciente, cita | consulta | F03 |
| GET `/consultations/:id` | Detalle | médico | — | consulta + secciones | F03 |
| PATCH `/consultations/:id` | Guarda borrador | médico | secciones | consulta | F03 |
| POST `/consultations/:id/sign` | Firma e inmoviliza | médico | versión | consulta firmada | F03 |
| POST `/consultations/:id/evolutions` | Agrega evolución | médico | nota | evolución | F03 |
| GET `/consultations/:id/pdf` | PDF de consulta | médico | — | PDF firmado | F05 |
| GET `/consultations/:id/diagnoses` | Diagnósticos | médico | — | lista | F03 |
| POST `/consultations/:id/diagnoses` | Agrega diagnóstico | médico | código, descripción, tipo | diagnóstico | F03 |
| DELETE `/consultations/:id/diagnoses/:diagnosisId` | Quita diagnóstico | médico | — | 204 | F03 |
| GET `/consultations/:id/prescriptions` | Recetas | médico | — | lista | F03 |
| POST `/consultations/:id/prescriptions` | Crea receta | médico | ítems | receta | F03 |
| PATCH `/prescriptions/:id` | Edita receta | médico | ítems | receta | F03 |
| GET `/patients/:id/studies` | Estudios | médico | tipo | lista | F04 |
| POST `/patients/:id/studies` | Registra estudio | médico | tipo, resultado, adjunto | estudio | F04 |
| POST `/images/presign` | URL de subida | médico | mime, tamaño | URL firmada | F04 |
| POST `/images` | Confirma imagen | médico | storageKey, paciente | imagen | F04 |
| DELETE `/images/:id` | Archiva imagen | médico | — | 204 | F04 |
| GET `/catalogs/:type` | Catálogos | autenticado | type, q | opciones | F03 |
| GET `/admin/users` | Lista usuarios | admin | filtros | lista | F06 |
| POST `/admin/users` | Crea usuario | admin | email, rol | usuario temporal | F06 |
| PATCH `/admin/users/:id` | Edita/desactiva | admin | campos | usuario | F06 |
| GET `/admin/professionals` | Lista profesionales | admin | filtros | lista | F06 |
| POST `/admin/professionals` | Crea profesional | admin | datos | profesional | F06 |
| GET `/admin/anamnesis-templates` | Plantillas | admin, médico | especialidad | plantilla | F03 |
| POST `/admin/anamnesis-templates` | Publica plantilla | admin | secciones | plantilla versionada | F03 |
| GET `/reports/summary` | Reporte gerencial | admin | rango | métricas | F05 |
| GET `/reports/quality` | Calidad de datos | admin | — | vista de issues | F05 |
| GET `/health` | Salud del servicio | público | — | estado | — |

Webhooks in: ninguno en v1; opcional S3/email. Webhooks out: email de confirmación/recordatorio.
Jobs: `appointment-reminders` cada hora, `overdue-appointments` diario, `image-cleanup` diario, `audit-retention` mensual, `quality-refresh` nocturno.

## The parts that bite

- Time zones: guardar UTC; la clínica define `America/Caracas` u otra zona. La agenda y los reportes se calculan en hora local.
- Overlap: la constraint de exclusión es la fuente de verdad; reprogramar es una transacción, no una validación de UI.
- Offline: borradores en IndexedDB con UUID generado en cliente e idempotency key. Al firmar, si la versión cambió, el servidor rechaza y muestra conflicto.
- Multi-tenancy: cada consulta filtra por `clinic_id`; nunca confiar en IDs del cliente. Test de IDOR por endpoint.
- PHI: TLS, cifrado en reposo, logs sin texto clínico, auditoría de lectura y exportación, retención configurable.
- Imágenes: límite de tamaño, validación de MIME real, análisis antivirus, URLs firmadas y cuarentena.
- Duplicados: documento normalizado + similitud trigram; fusionar pacientes es un flujo auditado, no un `delete`.
- Consultas firmadas: inmutables. Correcciones mediante evolución o enmienda versionada.
- CIE-10: el catálogo legacy es parcial; validar licencia y versión antes de exponer búsqueda completa.
- Migración: el cargador es idempotente por lote; no volver a ejecutar ETL sobre datos nuevos sin respaldo.

## Build order

1. Vertical slice: S01 login → S03 búsqueda/alta → S02 agenda → S06 consulta → S07 firma → S05 historia. Tablas `users`, `patients`, `appointments`, `consultations`, `audit_log`; rutas de auth, pacientes, agenda y consultas.
2. Must-haves: anamnesis por especialidad, diagnósticos, recetas, borradores offline, foto del paciente.
3. Should-haves: imágenes, estudios, antecedentes, convenios, baremo, reportes, PDF, auditoría visible.
4. Could-haves: detección de duplicados, multi-clínica, recordatorios, exportación FHIR.
5. Correcciones posteriores a la validación con usuarios reales.

## Risks

- La calidad del dato legacy limita reportes y búsquedas; 4.622 pacientes sin sexo y 164 sin documento.
- El alcance de facturación no está en este dump; confirmar si el Sistema de Clínicas se integra o queda fuera.
- La PWA offline es el requisito técnico más costoso; definir qué se puede editar sin conexión antes de construir.
- La migración de imágenes requiere acceso a los archivos originales, que no están en el dump.
