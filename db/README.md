# Migración PostgreSQL

Este directorio contiene la migración reproducible del dump MySQL `premiummedico` a PostgreSQL 16+.

## Requisitos

- PostgreSQL 16 o superior.
- Extensiones: `pgcrypto`, `pg_trgm`, `unaccent`, `btree_gist`.
- Node.js 20 o superior para el cargador de staging.
- `psql` para ejecutar los scripts.

## Orden de ejecución

```powershell
createdb historias_medicas

$env:DATABASE_URL = "postgres://postgres:postgres@localhost:5432/historias_medicas"

psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f db/001_schema.sql
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f db/migrations/008_optional_patient_document_and_age.sql
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f db/002_staging.sql
```

Cargar el dump MySQL en `legacy.raw_rows`:

```powershell
cd db
npm install
node load-legacy.js "..\DATARESPALDO 20261102 1219.sql"
```

Ejecutar el ETL y las vistas:

```powershell
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f db/003_etl.sql
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f db/004_views.sql
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f db/005_validation.sql
```

`005_validation.sql` reconstruye `public.migration_validation` y devuelve el resultado por consola. Los checks principales deben quedar en `ok`.

## Resultado esperado

| Check | Esperado | Real |
| --- | ---: | ---: |
| Filas legacy | 404.184 | 404.184 |
| Tablas legacy | 35 | 35 |
| Clínica | 1 | 1 |
| Citas importadas | 10.578 | 10.578 |
| Consultas importadas | 11.493 | 11.493 |
| Respuestas de anamnesis | 1.560 | 1.560 |
| Imágenes clínicas | 13 | 13 |
| Diagnósticos | 1 | 1 |
| Recetas | 1 | 1 |
| Pacientes duplicados por historia | 0 | 0 |
| Citas huérfanas | 0 | 0 |
| Consultas huérfanas | 0 | 0 |

## Decisiones aplicadas

- La clínica se crea con código `principal` a partir de `config`.
- Las citas con `especial = 'CI'` no se importan como citas; quedan registradas en `data_quality_issues`.
- Las citas históricas con estado abierto (`5`) se importan como `atendida` para no bloquear la agenda con la restricción de solapamiento.
- Las filas duplicadas de `consulta` y `consultamv` se colapsan por `legacy_id`; las diferencias quedan documentadas en `replica/data-migration.md`.
- Los registros clínicos sin médico se asignan al profesional stub `SIN_MEDICO`.
- Los pacientes sin ficha en `pacientes` pero con actividad clínica se crean como stub con `metadata.legacy_orphan = true`.
- Los códigos de anamnesis usan `tipo:codigo:idline` porque `anamex` reutiliza `codigo:idline` entre preguntas y examen físico.
- Los estudios de laboratorio usan `codigo.idline`; `examlab` se vincula por nombre del estudio.
- No se migran credenciales de `config` ni contraseñas legacy. Los usuarios quedan con `must_change_password = true`.

## Rollback

```sql
drop schema public cascade;
drop schema legacy cascade;
create schema public;
```

En producción no ejecutar el rollback sobre una base con datos nuevos. Restaurar desde respaldo.

## Limitaciones

- Las rutas de imágenes legacy son rutas Windows; los archivos no vienen en el dump. Se migra la metadata y se conserva `legacy_path` para un proceso posterior de carga a object storage.
- `pac_cuest` está vacío en el 99,6 % de las filas; solo se importan respuestas con contenido.
- El dump tiene texto con mojibake y fechas `0000-00-00`; los valores inválidos se normalizan a `NULL` y se registran en `data_quality_issues`.
- La validación se ejecutó contra PostgreSQL 18.6 embebido y el dump completo; el esquema es compatible con PostgreSQL 16.
