const CERTIFICATE_PREFIX = 'RB-COURSE';

export interface CertificateNumberOptions {
  sequence?: number;
  date?: Date;
}

const padSequence = (value: number, size = 5) =>
  value.toString().padStart(size, '0');

export const sanitizeSlug = (slug: string): string =>
  slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Generates a certificate number following the RB-COURSE-YYYY-##### pattern.
 * Accepts a course slug and optional deterministic sequence for testing.
 */
export function generateCertificateNumber(
  courseSlug: string,
  options: CertificateNumberOptions = {}
): string {
  const targetDate = options.date ?? new Date();
  const year = targetDate.getUTCFullYear();
  const normalizedSlug = sanitizeSlug(courseSlug)
    .replace(/-/g, '')
    .toUpperCase()
    .slice(0, 18);
  const sequence = options.sequence ?? Math.floor(Math.random() * 99999);

  return [CERTIFICATE_PREFIX, year, normalizedSlug, padSequence(sequence)].join(
    '-'
  );
}

export function parseCertificateNumber(certificateNumber: string) {
  const parts = certificateNumber.split('-');
  if (parts.length !== 5) {
    throw new Error('Invalid certificate number format');
  }
  const [rb, course, year, slug, sequence] = parts;
  return { prefix: `${rb}-${course}`, year, slug, sequence };
}

export function isCertificateNumber(value: string): boolean {
  return /^RB-COURSE-\d{4}-[A-Z0-9]{1,18}-\d{5}$/.test(value);
}
