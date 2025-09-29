import { describe, it, expect } from 'vitest';
import {
  generateCertificateNumber,
  isCertificateNumber,
  parseCertificateNumber,
} from '@/lib/certificates/ids';
import {
  buildVerificationUrl,
  createVerificationPayload,
} from '@/lib/certificates/qr';

describe('certificate id utilities', () => {
  it('builds deterministic certificate numbers with sequence', () => {
    const certificate = generateCertificateNumber('fullstack foundations', {
      date: new Date('2025-01-01T00:00:00Z'),
      sequence: 42,
    });

    expect(certificate).toBe('RB-COURSE-2025-FULLSTACKFOUNDATIO-00042');
    expect(isCertificateNumber(certificate)).toBe(true);
  });

  it('parses certificate number into parts', () => {
    const parts = parseCertificateNumber('RB-COURSE-2025-INTRODUCTION-00001');
    expect(parts).toEqual({
      prefix: 'RB-COURSE',
      year: '2025',
      slug: 'INTRODUCTION',
      sequence: '00001',
    });
  });

  it('throws on invalid certificate number', () => {
    expect(() => parseCertificateNumber('invalid')).toThrow(
      'Invalid certificate number format'
    );
  });
});

describe('QR payload utilities', () => {
  it('builds verification url', () => {
    const url = buildVerificationUrl(
      'https://portfolio.com/certificates',
      'RB-COURSE-2025-TEST-00001'
    );
    expect(url).toBe(
      'https://portfolio.com/certificates/RB-COURSE-2025-TEST-00001'
    );
  });

  it('creates an encoded payload with metadata', () => {
    const payload = createVerificationPayload({
      baseUrl: 'https://portfolio.com/certificates',
      certificateNumber: 'RB-COURSE-2025-TEST-00001',
      userId: 'user123',
      courseSlug: 'test-course',
    });

    expect(payload.verificationUrl).toContain('RB-COURSE-2025-TEST-00001');
    expect(() =>
      Buffer.from(payload.encodedPayload, 'base64url').toString()
    ).not.toThrow();
  });
});
