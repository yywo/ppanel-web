import { x25519 } from '@noble/curves/ed25519';

const toB64 = (u8: Uint8Array): string => {
  if (typeof Buffer !== 'undefined') return Buffer.from(u8).toString('base64');
  let s = '';
  for (const b of u8) s += String.fromCharCode(b);
  return btoa(s);
};

export type VlessX25519Pair = {
  passwordB64: string;
  privateKeyB64: string;
};

export function generateVlessX25519Pair(): VlessX25519Pair {
  const { secretKey, publicKey } = x25519.keygen();
  return {
    passwordB64: toB64(publicKey),
    privateKeyB64: toB64(secretKey),
  };
}
