import type { Consultation, Patient, PatientDetail, User } from '../types';

const DATABASE = 'ortho-spine-offline-v2';
const STORE = 'consultations';
const KEY_STORE = 'encryption-keys';
const CACHE_STORE = 'encrypted-cache';
const SYNC_TAG = 'sync-offline-consultations';

interface StoredConsultation {
  key: string;
  ownerId: string;
  consultationId: string;
  iv: number[];
  ciphertext: ArrayBuffer;
  updatedAt: string;
  pending: boolean;
  remoteId: string | null;
}

export interface PendingConsultation {
  consultation: Consultation;
  remoteId: string | null;
}

const keyLoads = new Map<string, Promise<CryptoKey>>();

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 2);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE)) {
        const records = database.createObjectStore(STORE, { keyPath: 'key' });
        records.createIndex('owner-pending', ['ownerId', 'pending']);
      }
      if (!database.objectStoreNames.contains(KEY_STORE)) database.createObjectStore(KEY_STORE, { keyPath: 'ownerId' });
      if (!database.objectStoreNames.contains(CACHE_STORE)) database.createObjectStore(CACHE_STORE, { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('No se pudo abrir el almacenamiento sin conexión.'));
  });
}

function requestResult<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('No se pudo leer el almacenamiento local.'));
  });
}

async function loadEncryptionKey(ownerId: string) {
  const database = await openDatabase();
  const read = database.transaction(KEY_STORE, 'readonly');
  const existing = await requestResult(read.objectStore(KEY_STORE).get(ownerId) as IDBRequest<{ ownerId: string; key: CryptoKey } | undefined>);
  if (existing?.key) {
    database.close();
    return existing.key;
  }

  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  const write = database.transaction(KEY_STORE, 'readwrite');
  write.objectStore(KEY_STORE).add({ ownerId, key });
  try {
    await new Promise<void>((resolve, reject) => {
      write.oncomplete = () => resolve();
      write.onerror = () => reject(write.error ?? new Error('No se pudo proteger la clave local.'));
      write.onabort = () => reject(write.error ?? new Error('No se pudo proteger la clave local.'));
    });
    database.close();
    return key;
  } catch (cause) {
    database.close();
    const retryDb = await openDatabase();
    const retry = retryDb.transaction(KEY_STORE, 'readonly');
    const winner = await requestResult(retry.objectStore(KEY_STORE).get(ownerId) as IDBRequest<{ ownerId: string; key: CryptoKey } | undefined>);
    retryDb.close();
    if (winner?.key) return winner.key;
    throw cause;
  }
}

async function encryptionKey(ownerId: string) {
  const active = keyLoads.get(ownerId);
  if (active) return active;
  const pending = loadEncryptionKey(ownerId);
  keyLoads.set(ownerId, pending);
  try {
    return await pending;
  } finally {
    keyLoads.delete(ownerId);
  }
}

function recordKey(ownerId: string, consultationId: string) {
  return `${ownerId}:${consultationId}`;
}

export async function saveOfflineConsultation(
  ownerId: string,
  consultation: Consultation,
  options: { pending: boolean; remoteId?: string | null }
) {
  if (!ownerId) throw new Error('No se encontró el usuario para proteger la consulta local.');
  const key = await encryptionKey(ownerId);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(consultation));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  const storageKey = recordKey(ownerId, consultation.id);
  const readDatabase = await openDatabase();
  const readTransaction = readDatabase.transaction(STORE, 'readonly');
  const previous = await requestResult(readTransaction.objectStore(STORE).get(storageKey) as IDBRequest<StoredConsultation | undefined>);
  readDatabase.close();

  const database = await openDatabase();
  const transaction = database.transaction(STORE, 'readwrite');
  const store = transaction.objectStore(STORE);
  store.put({
    key: storageKey,
    ownerId,
    consultationId: consultation.id,
    iv: [...iv],
    ciphertext,
    updatedAt: new Date().toISOString(),
    pending: options.pending,
    remoteId: options.pending ? (options.remoteId ?? previous?.remoteId ?? null) : null
  } satisfies StoredConsultation);
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('No se pudo guardar la consulta localmente.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('No se pudo guardar la consulta localmente.'));
  });
  database.close();
}

async function decryptStored(ownerId: string, stored: StoredConsultation): Promise<Consultation> {
  const key = await encryptionKey(ownerId);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(stored.iv) }, key, stored.ciphertext);
  return JSON.parse(new TextDecoder().decode(plaintext)) as Consultation;
}

async function putEncryptedCache(ownerId: string, cacheKey: string, value: unknown) {
  const key = await encryptionKey(ownerId);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(value)));
  const database = await openDatabase();
  const transaction = database.transaction(CACHE_STORE, 'readwrite');
  transaction.objectStore(CACHE_STORE).put({ key: `${ownerId}:${cacheKey}`, ownerId, iv: [...iv], ciphertext });
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('No se pudo actualizar la copia local.'));
  });
  database.close();
}

async function getEncryptedCache<T>(ownerId: string, cacheKey: string): Promise<T | null> {
  const database = await openDatabase();
  const transaction = database.transaction(CACHE_STORE, 'readonly');
  const stored = await requestResult(transaction.objectStore(CACHE_STORE).get(`${ownerId}:${cacheKey}`) as IDBRequest<{ iv: number[]; ciphertext: ArrayBuffer } | undefined>);
  database.close();
  if (!stored) return null;
  const key = await encryptionKey(ownerId);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(stored.iv) }, key, stored.ciphertext);
  return JSON.parse(new TextDecoder().decode(plaintext)) as T;
}

export function cacheOfflinePatient(ownerId: string, patient: Patient) {
  return putEncryptedCache(ownerId, `patient:${patient.id}`, patient);
}

export function getOfflinePatient(ownerId: string, patientId: string) {
  return getEncryptedCache<Patient>(ownerId, `patient:${patientId}`);
}

export function cacheOfflinePatientDetail(ownerId: string, detail: PatientDetail) {
  return putEncryptedCache(ownerId, `patient-detail:${detail.patient.id}`, detail);
}

export function getOfflinePatientDetail(ownerId: string, patientId: string) {
  return getEncryptedCache<PatientDetail>(ownerId, `patient-detail:${patientId}`);
}

export function cacheOfflineUser(firebaseUid: string, user: User) {
  return putEncryptedCache(`firebase:${firebaseUid}`, 'session', user);
}

export function getOfflineUser(firebaseUid: string) {
  return getEncryptedCache<User>(`firebase:${firebaseUid}`, 'session');
}

export async function getOfflineConsultation(ownerId: string, consultationId: string) {
  const database = await openDatabase();
  const transaction = database.transaction(STORE, 'readonly');
  const stored = await requestResult(transaction.objectStore(STORE).get(recordKey(ownerId, consultationId)) as IDBRequest<StoredConsultation | undefined>);
  database.close();
  return stored ? decryptStored(ownerId, stored) : null;
}

export async function getPendingConsultations(ownerId: string): Promise<PendingConsultation[]> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE, 'readonly');
  const index = transaction.objectStore(STORE).index('owner-pending');
  const records = await requestResult(index.getAll(IDBKeyRange.only([ownerId, true])) as IDBRequest<StoredConsultation[]>);
  database.close();
  const pending: PendingConsultation[] = [];
  for (const record of records) pending.push({ consultation: await decryptStored(ownerId, record), remoteId: record.remoteId });
  return pending.sort((left, right) => left.consultation.updatedAt.localeCompare(right.consultation.updatedAt));
}

export async function savePendingRemoteId(ownerId: string, consultation: Consultation, remoteId: string) {
  await saveOfflineConsultation(ownerId, consultation, { pending: true, remoteId });
}

export async function deleteOfflineConsultation(ownerId: string, consultationId: string) {
  const database = await openDatabase();
  const transaction = database.transaction(STORE, 'readwrite');
  transaction.objectStore(STORE).delete(recordKey(ownerId, consultationId));
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('No se pudo actualizar la consulta local.'));
  });
  database.close();
}

export function isNetworkUnavailable(cause: unknown) {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
  const error = cause as { code?: string; message?: string; name?: string } | null;
  return /network-request-failed|unavailable|deadline-exceeded/i.test(error?.code ?? '')
    || /failed to fetch|network|offline|connection|internet/i.test(`${error?.name ?? ''} ${error?.message ?? ''}`);
}

export async function registerOfflineConsultationSync() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    const current = await navigator.serviceWorker.getRegistration();
    if (!current) return;
    const registration = current as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } };
    await registration.sync?.register(SYNC_TAG);
  } catch {
    // Foreground `online` events remain as a fallback where Background Sync is unavailable.
  }
}

export function createOfflineConsultation(patient: Patient, user: User, input: { reason: string; consultationType?: string; consultedAt?: string; notes?: string }) {
  const now = new Date().toISOString();
  const id = `local-${crypto.randomUUID()}`;
  return {
    id,
    patientId: patient.id,
    patientName: patient.fullName,
    patientEmail: patient.email ?? null,
    recordNumber: patient.recordNumber,
    birthDate: patient.birthDate ?? null,
    sex: patient.sex,
    allergiesNotes: patient.allergiesNotes ?? null,
    professionalId: user.professionalId ?? '',
    professionalName: user.fullName,
    appointmentId: null,
    specialtyId: null,
    consultationType: input.consultationType ?? 'consulta',
    consultedAt: input.consultedAt ?? now,
    nextVisitAt: null,
    reason: input.reason,
    currentIllness: null,
    physicalExam: null,
    functionalExam: null,
    studies: null,
    evolutionText: '',
    studiesText: '',
    prescriptionText: '',
    diagnosisNotes: null,
    treatmentPlan: null,
    evolution: null,
    plan: null,
    notes: input.notes ?? null,
    prescriptionItems: [],
    vitals: {},
    status: 'borrador' as const,
    signedAt: null,
    createdAt: now,
    updatedAt: now
  } satisfies Consultation;
}
