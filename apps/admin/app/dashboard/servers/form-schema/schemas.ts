import { z } from 'zod';
import {
  ENCRYPTION_MODES,
  ENCRYPTION_RTT,
  ENCRYPTION_TYPES,
  FLOWS,
  multiplexLevels,
  SECURITY,
  SS_CIPHERS,
  TRANSPORTS,
  TUIC_CONGESTION,
  TUIC_UDP_RELAY_MODES,
  XHTTP_MODES,
} from './constants';

const nullableString = z.string().nullish();
const nullableBool = z.boolean().nullish();
const nullablePort = z.number().int().min(0).max(65535).nullish();

const ss = z.object({
  type: z.literal('shadowsocks'),
  enable: nullableBool,
  host: nullableString,
  port: nullablePort,
  cipher: z.enum(SS_CIPHERS).nullish(),
  server_key: nullableString,
  obfs: z.enum(['none', 'http', 'tls'] as const).nullish(),
  obfs_host: nullableString,
  obfs_path: nullableString,
});

const vmess = z.object({
  type: z.literal('vmess'),
  enable: nullableBool,
  host: nullableString,
  port: nullablePort,
  transport: z.enum(TRANSPORTS.vmess).nullish(),
  security: z.enum(SECURITY.vmess).nullish(),
  path: nullableString,
  service_name: nullableString,
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
});

const vless = z.object({
  type: z.literal('vless'),
  enable: nullableBool,
  host: nullableString,
  port: nullablePort,
  transport: z.enum(TRANSPORTS.vless).nullish(),
  security: z.enum(SECURITY.vless).nullish(),
  path: nullableString,
  service_name: nullableString,
  flow: z.enum(FLOWS.vless).nullish(),
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
  reality_server_addr: nullableString,
  reality_server_port: nullablePort,
  reality_private_key: nullableString,
  reality_public_key: nullableString,
  reality_short_id: nullableString,
  xhttp_mode: z.enum(XHTTP_MODES).nullish(),
  xhttp_extra: nullableString,
  encryption: z.enum(ENCRYPTION_TYPES).nullish(),
  encryption_mode: z.enum(ENCRYPTION_MODES).nullish(),
  encryption_rtt: z.enum(ENCRYPTION_RTT).nullish(),
  encryption_ticket: nullableString,
  encryption_server_padding: nullableString,
  encryption_private_key: nullableString,
  encryption_client_padding: nullableString,
  encryption_password: nullableString,
});

const trojan = z.object({
  type: z.literal('trojan'),
  enable: nullableBool,
  host: nullableString,
  port: nullablePort,
  transport: z.enum(TRANSPORTS.trojan).nullish(),
  security: z.enum(SECURITY.trojan).nullish(),
  path: nullableString,
  service_name: nullableString,
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
});

const hysteria2 = z.object({
  type: z.literal('hysteria2'),
  enable: nullableBool,
  hop_ports: nullableString,
  hop_interval: z.number().nullish(),
  obfs_password: nullableString,
  obfs: z.enum(['none', 'salamander'] as const).nullish(),
  port: nullablePort,
  security: z.enum(SECURITY.hysteria2).nullish(),
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
  up_mbps: z.number().nullish(),
  down_mbps: z.number().nullish(),
});

const tuic = z.object({
  type: z.literal('tuic'),
  enable: nullableBool,
  host: nullableString,
  port: nullablePort,
  disable_sni: z.boolean().nullish(),
  reduce_rtt: z.boolean().nullish(),
  udp_relay_mode: z.enum(TUIC_UDP_RELAY_MODES).nullish(),
  congestion_controller: z.enum(TUIC_CONGESTION).nullish(),
  security: z.enum(SECURITY.tuic).nullish(),
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
});

const anytls = z.object({
  type: z.literal('anytls'),
  enable: nullableBool,
  port: nullablePort,
  security: z.enum(SECURITY.anytls).nullish(),
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
  padding_scheme: nullableString,
});

const socks = z.object({
  type: z.literal('socks'),
  enable: nullableBool,
  port: nullablePort,
});

const naive = z.object({
  type: z.literal('naive'),
  enable: nullableBool,
  port: nullablePort,
  security: z.enum(SECURITY.naive).nullish(),
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
});

const http = z.object({
  type: z.literal('http'),
  enable: nullableBool,
  port: nullablePort,
  security: z.enum(SECURITY.http).nullish(),
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
});

const mieru = z.object({
  type: z.literal('mieru'),
  enable: nullableBool,
  port: nullablePort,
  multiplex: z.enum(multiplexLevels).nullish(),
  transport: z.enum(TRANSPORTS.mieru).nullish(),
});

export const protocolApiScheme = z.discriminatedUnion('type', [
  ss,
  vmess,
  vless,
  trojan,
  hysteria2,
  tuic,
  anytls,
  socks,
  naive,
  http,
  mieru,
]);

export const formSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  country: z.string().optional(),
  city: z.string().optional(),
  ratio: z.number().default(1),
  protocols: z.array(protocolApiScheme),
});
