import { Certificate } from '../models/Certificate.js';
import { computeOverallScore } from './scoringService.js';

export async function issueCertificateIfEligible(userId) {
  // Idempotent: if the user already has a certificate, return it instead of
  // issuing a duplicate.
  const existing = await Certificate.findByUser(userId);
  if (existing) return existing;

  const { percentage, eligibleForCertificate } = await computeOverallScore(userId);

  if (!eligibleForCertificate) {
    throw Object.assign(
      new Error(`Score too low for certification (${percentage}%). Threshold is 70%.`),
      { status: 403 }
    );
  }

  const certificate = await Certificate.create({ userId, score: percentage });
  return certificate;
}
