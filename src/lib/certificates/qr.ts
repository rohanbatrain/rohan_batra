import { URL } from 'url';

export interface VerificationPayloadOptions {
  baseUrl: string;
  certificateNumber: string;
  userId: string;
  courseSlug: string;
}

export interface VerificationPayload {
  verificationUrl: string;
  encodedPayload: string;
}

const encode = (data: Record<string, unknown>) =>
  Buffer.from(JSON.stringify(data)).toString('base64url');

export function buildVerificationUrl(
  baseUrl: string,
  certificateNumber: string
): string {
  const url = new URL(baseUrl);
  url.pathname = `${url.pathname.replace(/\/$/, '')}/${certificateNumber}`;
  return url.toString();
}

export function createVerificationPayload(
  options: VerificationPayloadOptions
): VerificationPayload {
  const verificationUrl = buildVerificationUrl(
    options.baseUrl,
    options.certificateNumber
  );
  const encodedPayload = encode({
    certificateNumber: options.certificateNumber,
    course: options.courseSlug,
    user: options.userId,
    issuedAt: Date.now(),
    verificationUrl,
  });

  return { verificationUrl, encodedPayload };
}
