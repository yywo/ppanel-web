import { z } from 'zod';

export const protocols = [
  'shadowsocks',
  'vmess',
  'vless',
  'trojan',
  'hysteria2',
  'tuic',
  'anytls',
] as const;

// Global label map for display; fallback to raw value if missing
export const LABELS = {
  // transport
  'tcp': 'TCP',
  'websocket': 'WebSocket',
  'http2': 'HTTP/2',
  'httpupgrade': 'HTTP Upgrade',
  'grpc': 'gRPC',
  'xtls-rprx-vision': 'XTLS-RPRX-Vision',
  // security
  'none': 'NONE',
  'tls': 'TLS',
  'reality': 'Reality',
  // fingerprint
  'chrome': 'Chrome',
  'firefox': 'Firefox',
  'safari': 'Safari',
  'ios': 'IOS',
  'android': 'Android',
  'edge': 'edge',
  '360': '360',
  'qq': 'QQ',
} as const;

// Flat arrays for enum-like sets
export const SS_CIPHERS = [
  'aes-128-gcm',
  'aes-192-gcm',
  'aes-256-gcm',
  'chacha20-ietf-poly1305',
  '2022-blake3-aes-128-gcm',
  '2022-blake3-aes-256-gcm',
  '2022-blake3-chacha20-poly1305',
] as const;

export const TRANSPORTS = {
  vmess: ['tcp', 'websocket', 'grpc', 'httpupgrade'] as const,
  vless: ['tcp', 'websocket', 'grpc', 'httpupgrade', 'http2'] as const,
  trojan: ['tcp', 'websocket', 'grpc'] as const,
} as const;

export const SECURITY = {
  vmess: ['none', 'tls'] as const,
  vless: ['none', 'tls', 'reality'] as const,
  trojan: ['tls'] as const,
  hysteria2: ['tls'] as const,
} as const;

export const FLOWS = {
  vless: ['none', 'xtls-rprx-vision'] as const,
} as const;

export const TUIC_UDP_RELAY_MODES = ['native', 'quic', 'none'] as const;
export const TUIC_CONGESTION = ['bbr', 'cubic', 'new_reno'] as const;
export const FINGERPRINTS = [
  'chrome',
  'firefox',
  'safari',
  'ios',
  'android',
  'edge',
  '360',
  'qq',
] as const;

export function getLabel(value: string): string {
  return (LABELS as Record<string, string>)[value] ?? value;
}

const nullableString = z.string().nullish();
const nullableBool = z.boolean().nullish();
const nullablePort = z.number().int().min(0).max(65535).nullish();

const ss = z.object({
  type: z.literal('shadowsocks'),
  host: nullableString,
  port: nullablePort,
  cipher: z.enum(SS_CIPHERS as any).nullish(),
  server_key: nullableString,
});

const vmess = z.object({
  type: z.literal('vmess'),
  host: nullableString,
  port: nullablePort,
  transport: z.enum(TRANSPORTS.vmess as any).nullish(),
  security: z.enum(SECURITY.vmess as any).nullish(),
  path: nullableString,
  service_name: nullableString,
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
});

const vless = z.object({
  type: z.literal('vless'),
  host: nullableString,
  port: nullablePort,
  transport: z.enum(TRANSPORTS.vless as any).nullish(),
  security: z.enum(SECURITY.vless as any).nullish(),
  path: nullableString,
  service_name: nullableString,
  flow: z.enum(FLOWS.vless as any).nullish(),
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
  reality_server_addr: nullableString,
  reality_server_port: nullablePort,
  reality_private_key: nullableString,
  reality_public_key: nullableString,
  reality_short_id: nullableString,
});

const trojan = z.object({
  type: z.literal('trojan'),
  host: nullableString,
  port: nullablePort,
  transport: z.enum(TRANSPORTS.trojan as any).nullish(),
  security: z.enum(SECURITY.trojan as any).nullish(),
  path: nullableString,
  service_name: nullableString,
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
});

const hysteria2 = z.object({
  type: z.literal('hysteria2'),
  hop_ports: nullableString,
  hop_interval: z.number().nullish(),
  obfs_password: nullableString,
  host: nullableString,
  port: nullablePort,
  security: z.enum(SECURITY.hysteria2 as any).nullish(),
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
});

const tuic = z.object({
  type: z.literal('tuic'),
  host: nullableString,
  port: nullablePort,
  disable_sni: z.boolean().nullish(),
  reduce_rtt: z.boolean().nullish(),
  udp_relay_mode: z.enum(TUIC_UDP_RELAY_MODES as any).nullish(),
  congestion_controller: z.enum(TUIC_CONGESTION as any).nullish(),
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
});

const anytls = z.object({
  type: z.literal('anytls'),
  host: nullableString,
  port: nullablePort,
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
});

export const protocolApiScheme = z.discriminatedUnion('type', [
  ss,
  vmess,
  vless,
  trojan,
  hysteria2,
  tuic,
  anytls,
]);

export const formSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  country: z.string().optional(),
  city: z.string().optional(),
  ratio: z.number().default(1),
  protocols: z.array(protocolApiScheme),
});

export type ProtocolType = (typeof protocols)[number];

export function getProtocolDefaultConfig(proto: ProtocolType) {
  switch (proto) {
    case 'shadowsocks':
      return {
        type: 'shadowsocks',
        port: null,
        cipher: 'chacha20-ietf-poly1305',
        server_key: null,
      } as any;
    case 'vmess':
      return { type: 'vmess', port: null, transport: 'tcp', security: 'none' } as any;
    case 'vless':
      return { type: 'vless', port: null, transport: 'tcp', security: 'none', flow: 'none' } as any;
    case 'trojan':
      return { type: 'trojan', port: null, transport: 'tcp', security: 'tls' } as any;
    case 'hysteria2':
      return {
        type: 'hysteria2',
        port: null,
        hop_ports: null,
        hop_interval: null,
        obfs_password: null,
        security: 'tls',
      } as any;
    case 'tuic':
      return {
        type: 'tuic',
        port: null,
        disable_sni: false,
        reduce_rtt: false,
        udp_relay_mode: 'native',
        congestion_controller: 'bbr',
      } as any;
    case 'anytls':
      return { type: 'anytls', port: null } as any;
    default:
      return {} as any;
  }
}
