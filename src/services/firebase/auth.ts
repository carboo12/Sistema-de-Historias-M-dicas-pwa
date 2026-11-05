import {
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser
} from 'firebase/auth';
import {
  getSession,
  linkCurrentUser,
  type GetSessionData
} from '@historias/dataconnect';
import { ApiError } from '../../lib/api';
import type { Role, User } from '../../types';
import { requireFirebase } from './client';

type SessionRecord = GetSessionData['users'][number];

function logAuthFailure(stage: string, cause: unknown) {
  const error = cause as { code?: string; message?: string; name?: string } | null;
  // Firebase error messages contain the provider's diagnostic but not the submitted password.
  console.error(`[Firebase] ${stage} failed`, {
    name: error?.name ?? 'Error',
    code: error?.code ?? 'unknown',
    message: error?.message ?? String(cause)
  });
}

function toApiError(cause: unknown): ApiError {
  const code = (cause as { code?: string } | null)?.code ?? '';
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'Correo o contraseÃ±a incorrectos',
    'auth/invalid-email': 'El correo electrÃ³nico no es vÃ¡lido',
    'auth/user-disabled': 'Este usuario estÃ¡ deshabilitado',
    'auth/user-not-found': 'Correo o contraseÃ±a incorrectos',
    'auth/wrong-password': 'Correo o contraseÃ±a incorrectos',
    'auth/operation-not-allowed': 'El inicio de sesiÃ³n con correo y contraseÃ±a no estÃ¡ habilitado en Firebase',
    'auth/api-key-not-valid': 'La clave de API de Firebase no es vÃ¡lida para este proyecto',
    'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e intÃ©ntalo de nuevo',
    'auth/network-request-failed': 'No hay conexiÃ³n con Firebase. Revisa tu red'
  };
  return new ApiError(
    messages[code] ?? (code ? `Error de Firebase (${code})` : 'No se pudo iniciar sesiÃ³n con Firebase'),
    401,
    code || 'firebase_auth_error',
    cause
  );
}

function mapSession(record: SessionRecord): User {
  return {
    id: record.id,
    clinicId: record.clinic.id,
    clinicName: record.clinic.name,
    timezone: record.clinic.timezone,
    currency: record.clinic.currency,
    username: record.username,
    email: record.email ?? null,
    fullName: record.fullName,
    role: record.role as Role,
    professionalId: record.professional_on_user?.id ?? null,
    mustChangePassword: record.mustChangePassword
  };
}

async function readSession(): Promise<User | null> {
  const { dataConnect } = requireFirebase();
  const { data } = await getSession(dataConnect);
  const record = data.users[0];
  return record ? mapSession(record) : null;
}

async function linkAndReadSession(firebaseUser: FirebaseUser): Promise<User | null> {
  const { dataConnect } = requireFirebase();

  if (!firebaseUser.emailVerified) {
    throw new ApiError(
      'Verifica tu correo electrÃ³nico antes de entrar. Revisa el mensaje que enviamos a tu bandeja.',
      403,
      'email_not_verified'
    );
  }

  await linkCurrentUser(dataConnect);
  return readSession();
}

export async function signInWithFirebase(identifier: string, password: string): Promise<User> {
  const { auth } = requireFirebase();
  const email = identifier.trim().toLowerCase();

  if (!email.includes('@')) {
    throw new ApiError(
      'Firebase Authentication requiere tu correo electrÃ³nico. Ingresa el correo asociado a tu cuenta.',
      400,
      'email_required'
    );
  }

  let stage = 'Authentication';
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    stage = 'Data Connect GetSession';
    const session = (await readSession()) ?? (await linkAndReadSession(credential.user));
    if (!session) {
      throw new ApiError(
        'No encontramos un usuario clÃ­nico activo asociado a este correo.',
        403,
        'user_not_linked'
      );
    }
    return session;
  } catch (cause) {
    logAuthFailure(stage, cause);
    if (cause instanceof ApiError) throw cause;
    throw toApiError(cause);
  }
}

export async function getFirebaseSession(): Promise<User> {
  const { auth } = requireFirebase();
  const firebaseUser = auth.currentUser;

  if (!firebaseUser) {
    throw new ApiError('SesiÃ³n no iniciada', 401, 'anonymous');
  }

  try {
    const session = (await readSession()) ?? (await linkAndReadSession(firebaseUser));
    if (!session) {
      throw new ApiError(
        'No encontramos un usuario clÃ­nico activo asociado a este correo.',
        403,
        'user_not_linked'
      );
    }
    return session;
  } catch (cause) {
    logAuthFailure('Data Connect GetSession', cause);
    if (cause instanceof ApiError) throw cause;
    throw toApiError(cause);
  }
}

export async function signOutFromFirebase(): Promise<void> {
  const { auth } = requireFirebase();
  await signOut(auth);
}


