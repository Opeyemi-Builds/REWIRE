import { Certificate } from '../models/Certificate.js';
import { computeOverallScore } from './scoringService.js';

export async function issueCertificateIfEligible(userId) {
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
