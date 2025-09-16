import mlkem from 'mlkem-wasm';
import { toB64Url } from './util';

export async function generateMLKEM768KeyPair() {
  const mlkemKeyPair = await mlkem.generateKey({ name: 'ML-KEM-768' }, true, [
    'encapsulateBits',
    'decapsulateBits',
  ]);
  const mlkemPublicKeyRaw = await mlkem.exportKey('raw-public', mlkemKeyPair.publicKey);
  const mlkemPrivateKeyRaw = await mlkem.exportKey('raw-seed', mlkemKeyPair.privateKey);

  return {
    publicKey: toB64Url(new Uint8Array(mlkemPublicKeyRaw)),
    privateKey: toB64Url(new Uint8Array(mlkemPrivateKeyRaw)),
  };
}
const test = await generateMLKEM768KeyPair();

console.log('生成的密钥信息:');
console.log('私钥长度:', test.privateKey.length);
console.log('公钥长度:', test.publicKey.length);
console.log(test);

// 从 VLESS 配置字符串中提取的密钥
const extractedKeys = {
  decryptionKey:
    'B2qLcDHhiztvBaB4BhMCnU-fM-axE4DZowMK9TIvL5qma2M5fVAmFswPdfej2N1SmlJa5ppidC1ksHLVfoEvjw',
  encryptionKey:
    'FgEI5sTIzBgZS4psemcdGDCRb5JvdDFqzOeVvLJYEmmZFSgxG1SkYxx8DUO-txGqvYdhFruja-ZzmIQoGOCQEMd0RbK4BhYRm4jE96GXTytu7Hi7pYo9-2SEuKC10righ2ceqis0LoggubajmAFvkop6igZfcmEA3MJ9aHpjGiUszDWy0pA99WY7c1ebTom8xQetW2J2OnkrA_UE8Cuy8AhMPvSBQrsFNmBqnttfVlmKzPS3RWBkIpAZIie1XMGk76nDEXgEsBulEhmYO2Mc-oRfirQfGmYfD1ybYBs9gAKgzQixTrkJtOuRU4GjkwQpxuyeVuww8Pin19IzAlVpUdeEJPVlRHwQDNJ__YsZDJB6rSIaY4tM4ysSs3N-1mmYvkVs1WSa0uy14KRheqMIPfsw_KxLBvp2_ZdZeQIrW3dDxgOuxXWip-g78desyONwwkx0bQK-JDcELHEH0TVmTOe4mSqW1fPI6jJI_ZChmQwBxZKpp2RN2xKmw6W3z4ETdUQDTZgePEkXDveneltNHrGT73WJQ7uEs6hwfXwD2vGcuFx6DKybfYAzgWh9t4IM3mBI7OiGqDItigqIDgaBF6LPTXwby3VxgfEVXXqXzMVdc0BL4da1BPGF-lAtvVJtbpBp7_O_JlB1wWajv8eLCpKjRiKGQey7oLZyRROQ3loNFyRDBjoBVSa2etCmFRCV1wegIBqmJRImJQxPsIV_kkIxeWmPfUIik1GpSTtrWkAFCXZAl4oSFiNhLwlmW_g_s_glGeqcZBNAkiw-OlssPESmqLti-bSJPbmoJMNE0poJXCYX27YyPKVyCtJKM5pzOkUBqMIVsxliU4N2IaWHb8uMYKW8U0tQ8aaeR3Bf5ll0fza78aY3lSQw7At21XkN9LhugzWv-_CPGZQpStGCWtJl5dChLPlmZbRddmekp7UEfXAPW6ONyNrFZ9WUvBCwsdmXcChTXwkg-FIMFHpU25c6IwWqyveuZrQmpvZYEQSgyWhsUBMPywI1vqiLfuhnaqBNU9wPbGA0IrG-w9UGpQErl9ssqPdZRjaIbiM-PKKooehp34QzU3ENj5h944gC4yHMkMzOPUaFl8YUWwmkGCsTNnJyq7NLucTOdQSUsLM2QWEkxWk9c6YyQkwx2mUsR1eGmrsbo8BGK6ppbgotpzMjGZfPOQRdHYh0lzGQ28HGetJ97Vei8Vxxl2u4j6CfHTPET4EHZ_uTuPtRIaaMegKOtUgyKqKj4BqsB5tatIECz8N1H_LP5qlRvUxYqrU-JikuRCoAdfl7VFYLLhe_80cny2UoWFpJ1iovprnALDbIIKZ03LG0OXI8dfEolQijO1xhwoUb7Ci3Xma-wKyEWHhSw0e600SRT0RhDuOh5hVg4KVLILUDDuMIJQyiPRBW3qwAMCk1SzCeXvFqbWFU-TQnVoLGNboaygQ6aumgP_B4DBcmEdyVqAMHIOdAPENvLauALKSiBHVjEHgeB7KpVCGsIGOjdCgb4UmKdsxnXBxC7peXspcmGgmHL-VU6KdMhwHwq1mYeNVEzeshb5mWYj5fgysp_e5U--geYKefs5Y',
};

console.log('提取的密钥信息:');
console.log('私钥长度:', extractedKeys.decryptionKey.length);
console.log('公钥长度:', extractedKeys.encryptionKey.length);
