import { x25519 } from '@noble/curves/ed25519.js';

function toB64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}
function fromB64Url(s: string) {
  const b64 = s
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(s.length / 4) * 4, '=');
  const bin = atob(b64);
  return new Uint8Array([...bin].map((c) => c.charCodeAt(0)));
}
/**
 * Generate a Reality key pair
 * @returns An object containing the private and public keys in base64url format
 */
export function generateRealityKeyPair() {
  const { secretKey, publicKey } = x25519.keygen();
  return { privateKey: toB64Url(secretKey), publicKey: toB64Url(publicKey) };
}

/**
 * Derive public key from private key
 * @param privateKeyB64Url Private key in base64url format
 * @returns Public key in base64url format
 */
export function publicKeyFromPrivate(privateKeyB64Url: string) {
  return toB64Url(x25519.getPublicKey(fromB64Url(privateKeyB64Url)));
}

/**
 * Generate a short ID for Reality
 * @returns A random hexadecimal string of length 2, 4, 6, 8, 10, 12, 14, or 16
 */
export function generateRealityShortId() {
  const hex = '0123456789abcdef';
  const lengths = [2, 4, 6, 8, 10, 12, 14, 16];
  const idx = Math.floor(Math.random() * lengths.length);
  const len = lengths[idx] ?? 16;
  let out = '';
  for (let i = 0; i < len; i++) {
    out += hex.charAt(Math.floor(Math.random() * hex.length));
  }
  return out;
}
