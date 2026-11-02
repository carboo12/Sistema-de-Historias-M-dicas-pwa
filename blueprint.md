# Blueprint — Historias Médicas PWA

## Estado

- Fase 1 (datos): completada y validada.
- Fase 2 (vertical slice): en construcción.
- UI: el MCP de Stitch devuelve `Incompatible auth server: does not support dynamic client registration`; se implementa con un sistema de diseño local hasta corregir la autenticación del MCP.

## Stack definitivo

- Web: React 19, Vite, TypeScript, React Router, TanStack Query.
- Estilos: Tailwind CSS + componentes propios accesibles.
- API: Fastify + TypeScript/JavaScript ESM, PostgreSQL 16+ con `pg`.
- Auth: sesión JWT en cookie httpOnly; contraseñas verificadas con `pgcrypto` (`crypt`).
- PWA: `vite-plugin-pwa`, manifest, service worker y cache solo de assets.
- Datos: esquema y ETL en `db/`; seed demo en `db/006_demo_seed.sql`.

## Estructura

```text
src/
  app/            router, providers, shell
  auth/           sesión y guardas
  components/     UI primitives y dominio
  features/
    agenda/
    patients/
    consultations/
  lib/            API client, formato, hooks
  pages/
server/
  routes/         auth, patients, agenda, consultations, catalogs
db/               migraciones y seed
replica/          recon, arquitectura, migración
```

## Alcance del primer vertical slice

1. Login con usuario demo y sesión persistente.
2. Agenda diaria con citas y creación de cita.
3. Búsqueda, alta y expediente de paciente.
4. Nueva consulta, edición de borrador, diagnósticos CIE-10 y firma.
5. PWA instalable, navegación responsive y estados vacíos/error.

## Reglas

- Toda consulta a la API filtra por `clinic_id`.
- Una consulta firmada no se edita; se corrige con evolución.
- La firma exige motivo y al menos un diagnóstico.
- Los datos clínicos no se registran en logs ni en cache del service worker.
- No se migran ni muestran secretos de `config`.
- UI en español; fechas en la zona horaria de la clínica.

## Checklist

- [x] Esquema, ETL y validación de datos.
- [x] Blueprint y scaffold.
- [ ] API de auth.
- [ ] API de pacientes.
- [ ] API de agenda.
- [ ] API de consultas y CIE-10.
- [ ] Login y shell.
- [ ] Pacientes.
- [ ] Agenda.
- [ ] Consulta y firma.
- [ ] Build, PWA y prueba end-to-end.
