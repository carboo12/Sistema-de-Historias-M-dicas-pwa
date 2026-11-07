import { api } from './data';
import {
  deleteOfflineConsultation,
  getPendingConsultations,
  saveOfflineConsultation,
  savePendingRemoteId
} from './offline-consultations';

async function processPendingConsultations(ownerId: string) {
  if (!navigator.onLine) return [];
  const pending = await getPendingConsultations(ownerId);
  const synced: Array<{ fromId: string; toId: string }> = [];

  for (const item of pending) {
    const { consultation } = item;
    let serverId = item.remoteId ?? (consultation.id.startsWith('local-') ? null : consultation.id);

    if (!serverId) {
      const created = await api.consultations.create({
        patientId: consultation.patientId,
        professionalId: consultation.professionalId || undefined,
        consultationType: consultation.consultationType,
        consultedAt: consultation.consultedAt,
        reason: consultation.reason,
        notes: consultation.notes
      });
      serverId = created.consultation.id;
      await savePendingRemoteId(ownerId, consultation, serverId);
    }

    const updated = await api.consultations.update(serverId, {
      reason: consultation.reason,
      nextVisitAt: consultation.nextVisitAt,
      currentIllness: consultation.currentIllness,
      physicalExam: consultation.physicalExam,
      functionalExam: consultation.functionalExam,
      studies: consultation.studies,
      evolutionText: consultation.evolutionText,
      studiesText: consultation.studiesText,
      prescriptionText: consultation.prescriptionText,
      diagnosisNotes: consultation.diagnosisNotes,
      treatmentPlan: consultation.treatmentPlan,
      evolution: consultation.evolution,
      plan: consultation.plan,
      notes: consultation.notes,
      vitals: consultation.vitals
    });

    await saveOfflineConsultation(ownerId, updated.consultation, { pending: false });
    if (consultation.id.startsWith('local-')) {
      await deleteOfflineConsultation(ownerId, consultation.id);
      synced.push({ fromId: consultation.id, toId: serverId });
    } else {
      synced.push({ fromId: consultation.id, toId: serverId });
    }
  }

  return synced;
}

export async function syncOfflineConsultations(ownerId: string) {
  const locks = (navigator as Navigator & { locks?: LockManager }).locks;
  if (!locks) return processPendingConsultations(ownerId);
  return locks.request('ortho-spine-offline-consultation-sync', { ifAvailable: true }, (lock) =>
    lock ? processPendingConsultations(ownerId) : []
  );
}
