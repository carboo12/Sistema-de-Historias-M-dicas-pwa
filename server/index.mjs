import './env.mjs';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import fastifyStatic from '@fastify/static';
import { resolve } from 'node:path';
import { HttpError } from './lib.mjs';
import { authRoutes, SESSION_COOKIE } from './routes/auth.mjs';
import { patientRoutes } from './routes/patients.mjs';
import { agendaRoutes } from './routes/agenda.mjs';
import { consultationRoutes } from './routes/consultations.mjs';
import { catalogRoutes } from './routes/catalogs.mjs';

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    redact: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password']
  },
  trustProxy: true
});

await app.register(cookie);
await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'dev-only-change-me',
  cookie: {
    cookieName: SESSION_COOKIE,
    signed: false
  }
});
await app.register(cors, {
  origin: process.env.APP_ORIGIN || 'http://localhost:5173',
  credentials: true
});

app.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch {
    return reply.code(401).send({
      error: { code: 'unauthorized', message: 'Inicia sesión para continuar' }
    });
  }
});

app.get('/api/health', async () => ({
  status: 'ok',
  service: 'historias-medicas-api',
  time: new Date().toISOString()
}));

await app.register(authRoutes);
await app.register(patientRoutes);
await app.register(agendaRoutes);
await app.register(consultationRoutes);
await app.register(catalogRoutes);

if (process.env.NODE_ENV === 'production') {
  await app.register(fastifyStatic, {
    root: resolve(process.cwd(), 'dist'),
    wildcard: false
  });
  app.setNotFoundHandler((request, reply) => {
    if (request.raw.url?.startsWith('/api/')) {
      return reply.code(404).send({
        error: { code: 'not_found', message: 'Ruta no encontrada' }
      });
    }
    return reply.sendFile('index.html');
  });
}

app.setErrorHandler((error, request, reply) => {
  if (error instanceof HttpError) {
    return reply.code(error.statusCode).send({
      error: { code: error.code, message: error.message }
    });
  }

  if (error.code === '23P01') {
    return reply.code(409).send({
      error: { code: 'appointment_overlap', message: 'El horario se solapa con otra cita' }
    });
  }

  if (error.code === '23505') {
    return reply.code(409).send({
      error: { code: 'duplicate', message: 'Ya existe un registro con esos datos' }
    });
  }

  if (error.code === '23503') {
    return reply.code(400).send({
      error: { code: 'invalid_reference', message: 'Una referencia relacionada no existe' }
    });
  }

  if (error.code === '22P02') {
    return reply.code(400).send({
      error: { code: 'invalid_format', message: 'Formato de dato inválido' }
    });
  }

  request.log.error({ err: error }, 'Unhandled API error');
  return reply.code(500).send({
    error: { code: 'internal_error', message: 'Ocurrió un error inesperado' }
  });
});

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || '0.0.0.0';

await app.listen({ port, host });

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    await app.close();
    process.exit(0);
  });
}
