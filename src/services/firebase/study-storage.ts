import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { requireFirebase } from './client';

export const MAX_STUDY_FILE_SIZE = 50 * 1024 * 1024;
const MIME_BY_EXTENSION: Record<string, string> = { dcm: 'application/dicom', dicom: 'application/dicom' };

export function studyMimeType(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return (!file.type || file.type === 'application/octet-stream')
    ? MIME_BY_EXTENSION[ext] || file.type || 'application/octet-stream'
    : file.type;
}

export function isSupportedStudyFile(file: File) {
  const mime = studyMimeType(file);
  return ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/dicom'].includes(mime);
}

async function makePreview(file: File): Promise<Blob | null> {
  if (!studyMimeType(file).startsWith('image/')) return null;
  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 720 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.78));
  } catch {
    return null;
  } finally {
    bitmap?.close();
  }
}

function safeName(name: string) {
  const cleaned = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  return cleaned.slice(-100) || 'estudio';
}

export async function uploadStudyAssets(input: { patientId: string; clinicId: string; file: File }) {
  const { auth, storage } = requireFirebase();
  const user = auth.currentUser;
  if (!user) throw new Error('La sesión de Firebase expiró. Inicia sesión nuevamente.');
  if (!isSupportedStudyFile(input.file)) throw new Error('Adjunta una imagen JPG, PNG o WebP, un archivo DICOM o un PDF.');
  if (input.file.size > MAX_STUDY_FILE_SIZE) throw new Error('El archivo supera el límite de 50 MB.');

  const basePath = `patients/${input.patientId}/studies/${user.uid}`;
  const token = crypto.randomUUID();
  const fileName = `${token}-${safeName(input.file.name)}`;
  const filePath = `${basePath}/${fileName}`;
  const mimeType = studyMimeType(input.file);
  const metadata = { contentType: mimeType, customMetadata: { clinicId: input.clinicId, originalName: input.file.name, uploadedBy: user.uid } };
  const uploadedPaths: string[] = [];

  try {
    const originalRef = ref(storage, filePath);
    await uploadBytes(originalRef, input.file, metadata);
    uploadedPaths.push(filePath);
    const fileUrl = await getDownloadURL(originalRef);
    const preview = await makePreview(input.file);
    let previewUrl: string | null = null;
    let previewPath: string | null = null;
    if (preview) {
      previewPath = `${basePath}/${token}-preview.webp`;
      const previewRef = ref(storage, previewPath);
      await uploadBytes(previewRef, preview, { contentType: 'image/webp', customMetadata: { clinicId: input.clinicId, uploadedBy: user.uid, preview: 'true' } });
      uploadedPaths.push(previewPath);
      previewUrl = await getDownloadURL(previewRef);
    }
    return { fileUrl, previewUrl, filePath, previewPath, fileName: input.file.name, mimeType, fileSize: input.file.size };
  } catch (error) {
    await Promise.all(uploadedPaths.map((path) => deleteObject(ref(storage, path)).catch(() => undefined)));
    throw error;
  }
}

export async function removeStudyAssets(paths: Array<string | null | undefined>) {
  const { storage } = requireFirebase();
  await Promise.all(paths.filter((path): path is string => Boolean(path)).map((path) => deleteObject(ref(storage, path)).catch(() => undefined)));
}
