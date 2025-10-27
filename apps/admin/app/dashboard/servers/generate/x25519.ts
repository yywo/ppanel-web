import * as x25519 from '@noble/ed25519';
import { toB64Url } from './util';

/**
 * Generate a Reality key pair
 * @returns An object containing the private and public keys in base64url format
 */
export async function generateRealityKeyPair() {
  const { secretKey, publicKey } = await x25519.keygenAsync();
  return { privateKey: toB64Url(secretKey), publicKey: toB64Url(publicKey) };
}
