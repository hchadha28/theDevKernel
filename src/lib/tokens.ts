import crypto from 'node:crypto'; // for 32 byte random string 

export function generateToken(): string {
  // crypto.randomBytes(32) creates 32 bytes of secure, random data
  // .toString('hex') converts that data into a 64-character long hex string
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(token);

  return hash.digest('hex');
}
