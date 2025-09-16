import { x25519 } from '@noble/curves/ed25519';

const toB64Url = (u8: Uint8Array) =>
  (typeof Buffer !== 'undefined'
    ? Buffer.from(u8).toString('base64')
    : btoa(String.fromCharCode(...u8))
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

export type VlessX25519Pair = {
  passwordB64: string;
  privateKeyB64: string;
};

export function generateVlessX25519Pair(): VlessX25519Pair {
  const { secretKey, publicKey } = x25519.keygen();
  return {
    passwordB64: toB64Url(publicKey),
    privateKeyB64: toB64Url(secretKey),
  };
}
