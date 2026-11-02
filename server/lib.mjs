export class HttpError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function assert(condition, statusCode, code, message) {
  if (!condition) throw new HttpError(statusCode, code, message);
}

export function text(value, max = 5000) {
  if (value === null || value === undefined) return null;
  const clean = String(value).trim();
  return clean === '' ? null : clean.slice(0, max);
}

export function requiredText(value, field, max = 5000) {
  const clean = text(value, max);
  assert(clean, 400, 'validation_error', `${field} es obligatorio`);
  return clean;
}

export function isUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function uuid(value, field = 'id') {
  assert(isUuid(value), 400, 'validation_error', `${field} inválido`);
  return value;
}

export function isoDate(value, field = 'fecha') {
  const date = new Date(value);
  assert(!Number.isNaN(date.getTime()), 400, 'validation_error', `${field} inválido`);
  return date.toISOString();
}

export function positiveInt(value, field, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  const number = Number(value);
  assert(Number.isInteger(number) && number > 0, 400, 'validation_error', `${field} inválido`);
  return number;
}

export function jsonObject(value) {
  if (value === undefined || value === null) return {};
  assert(typeof value === 'object' && !Array.isArray(value), 400, 'validation_error', 'Se esperaba un objeto');
  return value;
}

export async function audit(client, request, action, entity, entityId, before = null, after = null) {
  await client.query(
    `insert into public.audit_log
      (clinic_id, user_id, action, entity, entity_id, before, after, ip, user_agent)
     values ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9)`,
    [
      request.user.clinicId,
      request.user.sub,
      action,
      entity,
      entityId ? String(entityId) : null,
      before ? JSON.stringify(before) : null,
      after ? JSON.stringify(after) : null,
      request.ip,
      request.headers['user-agent'] ?? null
    ]
  );
}
