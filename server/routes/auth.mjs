import { query, one } from '../db.mjs';
import { HttpError, text } from '../lib.mjs';

export const SESSION_COOKIE = 'hm_session';

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8
  };
}

function publicUser(row) {
  return {
    id: row.id,
    clinicId: row.clinic_id,
    clinicName: row.clinic_name,
    timezone: row.timezone,
    currency: row.currency,
    username: row.username,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    professionalId: row.professional_id ?? null,
    mustChangePassword: row.must_change_password
  };
}

export async function authRoutes(app) {
  app.post('/api/auth/login', async (request, reply) => {
    const identifier = text(request.body?.identifier, 320);
    const password = text(request.body?.password, 500);

    if (!identifier || !password) {
      throw new HttpError(400, 'validation_error', 'Usuario y contraseña son obligatorios');
    }

    const result = await query(
      `select
         u.id, u.clinic_id, u.username, u.email, u.full_name, u.role,
         u.must_change_password, u.password_hash, u.locked_until,
         c.name as clinic_name, c.timezone, c.currency,
         p.id as professional_id,
         case
           when u.password_hash like '$2%' then crypt($2, u.password_hash) = u.password_hash
           else false
         end as password_ok
       from public.users u
       join public.clinics c on c.id = u.clinic_id
       left join public.professionals p on p.user_id = u.id
       where u.is_active
         and (lower(u.username) = lower($1) or lower(coalesce(u.email, '')) = lower($1))
       limit 1`,
      [identifier, password]
    );

    const row = result.rows[0];
    if (!row || !row.password_ok) {
      throw new HttpError(401, 'invalid_credentials', 'Usuario o contraseña incorrectos');
    }

    if (row.locked_until && new Date(row.locked_until) > new Date()) {
      throw new HttpError(423, 'account_locked', 'La cuenta está bloqueada temporalmente');
    }

    await query('update public.users set last_login_at = now(), failed_login_attempts = 0 where id = $1', [row.id]);

    const token = app.jwt.sign(
      {
        sub: row.id,
        clinicId: row.clinic_id,
        role: row.role,
        name: row.full_name,
        timezone: row.timezone,
        currency: row.currency,
        professionalId: row.professional_id ?? null
      },
      { expiresIn: '8h' }
    );

    reply.setCookie(SESSION_COOKIE, token, cookieOptions());
    return { user: publicUser(row) };
  });

  app.get('/api/auth/me', { preHandler: [app.authenticate] }, async (request) => {
    const row = await one(
      `select
         u.id, u.clinic_id, u.username, u.email, u.full_name, u.role,
         u.must_change_password,
         c.name as clinic_name, c.timezone, c.currency,
         p.id as professional_id
       from public.users u
       join public.clinics c on c.id = u.clinic_id
       left join public.professionals p on p.user_id = u.id
       where u.id = $1 and u.is_active`,
      [request.user.sub]
    );

    if (!row) throw new HttpError(401, 'unauthorized', 'Sesión no válida');
    return { user: publicUser(row) };
  });

  app.post('/api/auth/logout', async (_request, reply) => {
    reply.clearCookie(SESSION_COOKIE, { path: '/' });
    return reply.code(204).send();
  });
}

export function requireRole(...roles) {
  return async (request) => {
    if (!roles.includes(request.user?.role)) {
      throw new HttpError(403, 'forbidden', 'No tienes permiso para realizar esta acción');
    }
  };
}
