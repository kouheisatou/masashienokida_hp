export function assertSecureEnv(): void {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 bytes. Set a strong random value (e.g. `openssl rand -base64 48`).',
    );
  }
}
