# Migración de datos: MySQL `premiummedico` → PostgreSQL

## Fuente y destino

- Fuente: `DATARESPALDO 20261102 1219.sql`, MySQL 5.5.41, base `premiummedico`.
- Destino: PostgreSQL 16+, 33 tablas en `public` y staging en `legacy`.
- Filas cargadas en staging: **404.184** en **35 tablas**.
- Validación ejecutada contra PostgreSQL 18.6 embebido con el dump completo.
- Scripts: `db/001_schema.sql` → `002_staging.sql` → `003_etl.sql` → `004_views.sql` → `005_validation.sql`.
- Cargador: `db/load-legacy.js`.

## Mapeo

| Fuente legacy | Filas | Destino | Filas | Nota |
| --- | ---: | --- | ---: | --- |
| `config` | 1 | `clinics` | 1 | Código `principal`; secretos SMTP/FTP/DB no se migran. |
| `usuarios` | 3 | `users` | 3 | Contraseñas legacy no se conservan; reset obligatorio. |
| `listvend` | 2 | `professionals` | 4 | 2 reales + `SIN_MEDICO` + profesional referenciado. |
| `especial` | 2 | `specialties` | 2 | Catálogo de especialidades. |
| `consultorios` | 2 | `offices` | 2 | Consultorios de la clínica. |
| `tipohis` | 2 | `history_types` | 2 | Tipos de historia. |
| `motivoconsultas` | 4 | `consultation_reasons` | 4 | Motivos de consulta. |
| `tipodocu` | 2 | `document_types` | 2 | Tipos de documento. |
| `pacientes` | 4.649 | `patients` | 4.652 | 3 stubs por actividad clínica sin ficha. |
| campos de antecedentes | — | `patient_history` | 50 | Normalizados a categoría/descripción/fecha. |
| `diagoms` | 12.463 | `cie10_codes` | 12.463 | Catálogo parcial; validar licencia CIE-10. |
| `vademecun` | 139 | `medications` | 139 | Vademécum legacy. |
| `anamex` | 30 | `anamnesis_items` | 30 | `item_code = tipo:codigo:idline`. |
| `examen`, `tipoexam`, `examencardio*`, `examenradio*` | 138 | `diagnostic_studies` | 138 | Catálogo de estudios; incluye tablas de detalle. |
| `citas` | 11.813 | `appointments` | 10.578 | Excluye 1.230 `CI`, 4 sin fecha y 1 pseudo. |
| `consulta` | 4.545 | `consultations` | 4.530 | 15 duplicados colapsados. |
| `consultamv` | 7.249 | `consultations` | 6.963 | 6.954 únicos + 9 con médico vacío → `SIN_MEDICO`; 278 duplicados. |
| `diag_hist` | 2 | `consultation_diagnoses` | 1 | Una fila pseudo o sin datos útiles. |
| `recipes` | 2 | `prescriptions` / `prescription_items` | 1 / 1 | Una receta pseudo. |
| `examlab` | 3 | `patient_studies` | 0 | Solo existen para historia pseudo `00`. |
| `imagenes` + `imgenmov` + `imgotros` | 19 | `clinical_images` | 13 | Solo con ruta e historia de paciente real; 5 sin ruta. |
| `pac_cuest` | 362.860 | `patient_anamnesis_answers` | 1.560 | 99,6 % sin respuesta; solo se importa contenido. |
| `reportes` | 15 | `report_definitions` | 15 | Catálogo de reportes. |
| `baremo`, `empresas` | 0 | `fee_schedule`, `companies`, `patient_coverages` | 0 | Tablas legacy vacías; el modelo queda listo. |
| `errores` | 34 | `data_quality_issues` | — | Se normalizan a issues específicos. |
| `optmenu`, `optsubmenu`, `useroption`, `ahelp` | 203 | — | No se migran; la navegación se rediseña. |

## Transformaciones

- Texto: `legacy.clean_text` recorta y normaliza espacios; `clean_clinical` conserva saltos de línea clínicos.
- Documentos: `legacy.norm_document` elimina puntos, guiones y espacios.
- Códigos: `legacy.norm_code` usa mayúsculas sin acentos.
- Sexo: `legacy.map_sex`; valores no reconocidos → `NULL` + issue `unknown_sex`.
- Estado civil: `legacy.map_marital_status`.
- Citas: `legacy.map_appointment_status`; estados abiertos históricos → `atendida`.
- Consultas: `legacy.map_consultation_status`.
- Fechas: `legacy.safe_date` convierte `0000-00-00` y variantes inválidas a `NULL`.
- País: `legacy.map_country` unifica nombres y variantes.
- Anamnesis: `legacy.anamnesis_code(tipo, codigo, idline)` evita colisiones entre pregunta y examen físico.
- Historia clínica: `legacy.is_pseudo_history` detecta historias `00`, `000`, `0` y similares.
- Moneda: `legacy.currency_code` con `VES` por defecto.
- `legacy.hash_key` genera IDs deterministas para deduplicar filas legacy.

## Calidad de datos

`public.data_quality_issues`: **6.024** registros.

| Issue | Filas | Acción |
| --- | ---: | --- |
| `unknown_sex` | 4.622 | Completar en ficha o dejar `NULL`; no bloquea la migración. |
| `ci_marker_excluded` | 1.230 | Citas marcadas `CI`; no se importan como citas. |
| `missing_document` | 164 | Paciente existe sin cédula; permitir búsqueda por nombre/historia. |
| `zero_or_invalid_birth_date` | 5 | Fecha `NULL`; revisar manualmente. |
| `duplicate_document` | 3 | Grupos de cédula duplicada; revisar y fusionar. |

Otros hallazgos:

- 3 pacientes stub sin ficha real, creados para no perder actividad clínica.
- 293 filas de consulta duplicadas colapsadas: 15 en `consulta`, 278 en `consultamv`.
- 9 consultas sin médico asignado → `SIN_MEDICO`.
- 5 imágenes no pseudo sin ruta de archivo.
- 3 estudios de laboratorio solo con historia pseudo `00`.
- 0 citas futuras: toda la agenda legacy es histórica.
- 50 antecedentes; el resto de pacientes no tiene antecedentes estructurados.

## Validación

`db/005_validation.sql` ejecuta checks automáticos y deja el resultado en `public.migration_validation`.

| Check | Esperado | Real | Estado |
| --- | ---: | ---: | --- |
| `legacy_rows` | 404.184 | 404.184 | info |
| `clinics` | 1 | 1 | ok |
| `appointments_imported` | 10.578 | 10.578 | ok |
| `consultations_imported` | 11.493 | 11.493 | ok |
| `anamnesis_answers_imported` | 1.560 | 1.560 | ok |
| `clinical_images_imported` | 13 | 13 | ok |
| `diagnoses_imported` | 1 | 1 | ok |
| `prescriptions_imported` | 1 | 1 | ok |
| `patients_duplicate_record_number` | 0 | 0 | ok |
| `appointments_orphans` | 0 | 0 | ok |
| `consultations_orphans` | 0 | 0 | ok |
| `consultations_signed_without_timestamp` | 0 | 0 | ok |

Vistas:

| Vista | Filas | Lectura |
| --- | ---: | --- |
| `v_patient_summary` | 4.652 | Una fila por paciente. |
| `v_today_agenda` | 0 | No hay citas de hoy en el dump. |
| `v_upcoming_appointments` | 0 | No hay citas futuras. |
| `v_consultation_summary` | 11.493 | Una fila por consulta. |
| `v_patient_diagnoses` | 1 | Solo un diagnóstico legacy útil. |
| `v_patient_medications` | 1 | Solo una receta legacy útil. |
| `v_data_quality_summary` | 5 | Cinco tipos de issue. |
| `v_duplicate_patients` | 3 | Tres grupos de cédula duplicada. |
| `v_legacy_row_counts` | 35 | Conteo por tabla legacy. |

## Decisiones y pendientes

Decisiones:

- No migrar secretos ni contraseñas.
- No inventar citas futuras ni datos clínicos faltantes.
- Conservar `legacy_id` y `legacy_path` para trazabilidad.
- Marcar pacientes stub con `metadata.legacy_orphan = true`.
- Asignar `SIN_MEDICO` cuando el médico legacy no existe.
- Colapsar duplicados por `legacy_id`; no sumar filas duplicadas a los reportes.

Pendientes:

- Incorporar los duplicados de consultas y de historias a `data_quality_issues` si se quiere reporte explícito.
- Definir si los 3 grupos de cédula duplicada se fusionan o se mantienen con alerta.
- Cargar las imágenes originales desde las rutas Windows a object storage.
- Validar la versión y licencia de CIE-10 antes de exponer el catálogo completo.
- Confirmar si facturación, convenios y baremo entran en v1 o quedan en el Sistema de Clínicas.
