# Recon map: Historias Médicas Desktop (Windows)

Scope: núcleo clínico y administrativo — pacientes, agenda, consultas, evolución, diagnósticos, recetas, estudios, imágenes, anamnesis y reportes.
For: clínica/consultorio que migra desde Premium-soft Desktop a una PWA multi-dispositivo.
Date: 2026-11-02

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | Sitio oficial Premium-soft | https://premium-soft.com/soluciones/sistema-de-historias-medicas/ | Características, requisitos, disponibilidad por país y posicionamiento. |
| 2 | Dump MySQL del usuario | `DATARESPALDO 20261102 1219.sql` | Base `premiummedico`; 54 tablas, 35 con datos. Evidencia principal del modelo real. |
| 3 | Video “Historias Médicas Desktop” | https://premium-soft.com/soluciones/sistema-de-historias-medicas/ | Referencia de producto; no se accedió a la aplicación instalada. |
| 4 | Documentación pública | — | No se encontró help center específico del producto. |

No se usaron credenciales, binarios, endpoints privados ni capturas de la aplicación. La pantalla y los flujos se infieren del esquema, de las tablas con datos y de la web pública; su confianza se marca en cada caso.

## Core loop

Registrar al paciente, agendar su cita, documentar la consulta y dejar la historia clínica completa —diagnóstico, tratamiento, recetas, estudios e imágenes— disponible para la siguiente atención.

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Inicio de sesión | `/login` | Autenticar usuario y seleccionar consultorio | usuario, contraseña, selector de consultorio | inferida; credenciales legacy en texto plano |
| S02 | Agenda / escritorio | `/agenda` | Ver citas del día y accesos rápidos | calendario, filtros por médico, estados de cita, búsqueda | inferida desde `citas`, `agendaus` |
| S03 | Búsqueda de pacientes | `/pacientes` | Buscar por historia, cédula, nombre o teléfono | tabla, filtros, alta rápida, indicador de duplicados | inferida desde `pacientes` |
| S04 | Ficha del paciente | `/pacientes/:id` | Datos demográficos, foto, coberturas y antecedentes | foto, datos personales, contacto, convenio, antecedentes | inferida; 4.652 pacientes migrados |
| S05 | Historia clínica | `/pacientes/:id/historia` | Línea de tiempo de consultas, estudios e imágenes | timeline, filtros por tipo, adjuntos | inferida desde `consulta`, `consultamv`, `diag_hist` |
| S06 | Nueva consulta | `/consultas/nueva?paciente=` | Registrar motivo, anamnesis, examen, diagnóstico y plan | formulario por especialidad, autosave, firma | inferida; `consulta` y `consultamv` |
| S07 | Detalle de consulta | `/consultas/:id` | Revisar, firmar o imprimir una consulta | secciones clínicas, auditoría, impresión/PDF | inferida; estados legacy |
| S08 | Evolución | `/consultas/:id/evolucion` | Agregar notas de evolución a una atención | editor clínico, fecha/hora, autor | inferida desde `consultamv` y `motevoluc` |
| S09 | Diagnósticos | `/consultas/:id/diagnosticos` | Asociar diagnósticos a la consulta | buscador CIE/catálogo, principal/secundario | inferida; `diag_hist` y `diagoms` |
| S10 | Recetas | `/consultas/:id/recetas` | Prescribir desde vademécum | buscador, dosis, vía, frecuencia, duración | inferida; `recipes`, `vademecun` |
| S11 | Estudios e imágenes | `/pacientes/:id/estudios` | Laboratorio, cardiología, rayos X y fotos clínicas | órdenes, resultados, visor de imágenes | inferida; `examlab`, `examcardio`, `examrx`, `imagenes` |
| S12 | Anamnesis por especialidad | `/config/anamnesis` | Configurar preguntas y examen físico por especialidad | editor de secciones, orden, tipo | inferida; `anamex`, `especial` |
| S13 | Reportes | `/reportes` | Estadísticas médicas y gerenciales | filtros por fecha/médico, exportación | inferida; `reportes` |
| S14 | Baremo y convenios | `/config/baremo` | Tarifas profesionales y acuerdos con empresas/aseguradoras | tarifas, convenios, vigencias | inferida; `baremo`, `empresas` vacías |
| S15 | Usuarios y configuración | `/admin` | Usuarios, profesionales, consultorios, parámetros | CRUD, roles, datos de la clínica | inferida; `usuarios`, `listvend`, `consultorios`, `config` |

## Flows

```
F01 Registrar paciente y abrir historia
    S03 búsqueda -> S04 alta/edición -> S05 historia
    happy path clicks: 3
    edge: cédula duplicada, paciente sin documento, historia pseudo, foto no disponible

F02 Agendar cita
    S02 agenda -> S03 buscar paciente -> formulario de cita -> S02 confirmación
    happy path clicks: 4
    edge: solapamiento de médico, cita en el pasado, médico inactivo, paciente nuevo

F03 Documentar consulta
    S02 cita -> S06 nueva consulta -> anamnesis/examen -> S09 diagnóstico -> S10 receta -> S07 firma
    happy path clicks: 4–6
    edge: borrador sin conexión, consulta firmada, paciente con antecedentes, especialidad sin plantilla

F04 Adjuntar estudio o imagen
    S05 historia -> S11 estudios -> subir archivo -> asociar a consulta
    happy path clicks: 3
    edge: archivo grande, formato no permitido, ruta legacy inexistente, imagen sin paciente

F05 Consultar reporte
    S13 reportes -> filtros -> tabla -> exportar
    happy path clicks: 2
    edge: rango vacío, usuario sin permiso, muchas filas

F06 Administrar usuarios y catálogos
    S15 admin -> usuario/profesional -> guardar -> auditoría
    happy path clicks: 3
    edge: correo duplicado, último administrador, contraseña temporal
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Button | primary, secondary, ghost, danger | default, hover, focus, disabled, loading | all |
| Input / Textarea | text, search, password, clinical | default, focus, error, disabled, read-only | all forms |
| Date/time picker | date, time, range | default, invalid, disabled, timezone | S02, S06, S08, S13 |
| Patient header | compact, full | loading, missing photo, alerts | S04–S11 |
| Data table | patients, appointments, audit | loading, empty, error, paginated | S02, S03, S09, S13, S15 |
| Status badge | appointment, consultation, study | scheduled, waiting, attended, cancelled, signed, draft | S02, S05, S07 |
| Clinical section | anamnesis, exam, diagnosis, plan | collapsed, editing, saved, signed | S06–S08 |
| File uploader | image, PDF, DICOM link | idle, uploading, error, preview | S11 |
| Confirm dialog | delete, sign, cancel | default, destructive | S04–S11 |
| Toast | success, error, warning | auto-dismiss, action | all |
| Empty state | first use, filtered, permission | default | S02–S13 |

## Inferred data model

```
Clinic        id, code, name, address, phone, timezone, settings
              evidence: config, consultorios; confidence: high

User          id, clinic_id, email, password_hash, role, must_change_password
              evidence: usuarios; confidence: high

Professional  id, clinic_id, user_id?, name, license, specialty, active, stub
              evidence: listvend, especial, citas.medico; confidence: high

Patient       id, clinic_id, record_number, document_type, document_number,
              first_name, last_name, birth_date, sex, phone, address, photo_url
              evidence: pacientes; confidence: high

PatientHistory  patient_id, category, description, occurred_at
              evidence: antecedentes legacy; confidence: medium

Coverage      patient_id, company, plan, member_number, valid_from, valid_to
              evidence: empresas/baremo (vacías); confidence: guess

Appointment   id, patient_id, professional_id, starts_at, ends_at, status,
              reason, notes
              evidence: citas; confidence: high

Consultation  id, patient_id, professional_id, appointment_id?, occurred_at,
              reason, symptoms, physical_exam, plan, status, signed_at
              evidence: consulta, consultamv; confidence: high

Diagnosis     consultation_id, patient_id, code, description, type
              evidence: diag_hist, diagoms; confidence: high

Prescription  consultation_id, patient_id, medication, dose, route,
              frequency, duration, instructions
              evidence: recipes, vademecun; confidence: high

Study         patient_id, consultation_id?, type, code, name, result, status
              evidence: examlab, examcardio, examrx; confidence: medium

ClinicalImage patient_id, consultation_id?, kind, legacy_path, storage_key,
              captured_at
              evidence: imagenes, imgenmov, imgotros; confidence: high

AnamnesisItem  specialty_id, kind, code, label, input_type, options, sort_order
              evidence: anamex; confidence: high

AnamnesisAnswer patient_id, consultation_id?, item_id, value, details
              evidence: pac_cuest; confidence: high

AuditEvent    clinic_id, actor_id, action, entity, entity_id, before, after,
              ip, created_at
              evidence: ausente en legacy; confidence: guess
```

Relationships: Clinic 1-n User/Professional/Patient; Patient 1-n Appointment/Consultation/Image/AnamnesisAnswer; Consultation 1-n Diagnosis/Prescription/Study; Specialty 1-n AnamnesisItem; Professional 1-n Appointment/Consultation.

## Feature matrix

See `features.csv`. Must: 12, should: 9, could: 4, skip: 3.

## Out of scope (cannot or should not be cloned)

- Facturación fiscal, inventario de farmacia y tesorería: pertenecen al Sistema de Clínicas, no a este dump.
- Interoperabilidad HL7/FHIR y PACS/DICOM real: requieren servidores y licencias externas.
- Archivos de imagen originales: el dump solo contiene rutas locales de Windows.
- Credenciales, SMTP/FTP y llaves de `config`: no se migran ni se replican.
- CIE-10 completo: el catálogo legacy es parcial y la versión licenciada debe validarse.
- Firma electrónica certificada: se implementa firma clínica interna, no firma digital legal.

## Size

Screens 15, flows 6, entities 15. Hard parts: offline drafts and conflict resolution, appointment overlap with time zones, multi-tenant authorization, image storage, legacy data quality, clinical audit. Size: L.
