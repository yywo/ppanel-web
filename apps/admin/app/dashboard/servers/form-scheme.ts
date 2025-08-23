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

const nullableString = z.string().nullish();
const portScheme = z.number().max(65535).nullish();

const securityConfigScheme = z
  .object({
    sni: nullableString,
    allow_insecure: z.boolean().nullable().default(false),
    fingerprint: nullableString,
    reality_private_key: nullableString,
    reality_public_key: nullableString,
    reality_short_id: nullableString,
    reality_server_addr: nullableString,
    reality_server_port: portScheme,
  })
  .nullish();

const transportConfigScheme = z
  .object({
    path: nullableString,
    host: nullableString,
    service_name: nullableString,
  })
  .nullish();

const shadowsocksScheme = z.object({
  method: z.string(),
  port: portScheme,
  server_key: nullableString,
});

const vmessScheme = z.object({
  port: portScheme,
  transport: z.string(),
  transport_config: transportConfigScheme,
  security: z.string(),
  security_config: securityConfigScheme,
});

const vlessScheme = z.object({
  port: portScheme,
  transport: z.string(),
  transport_config: transportConfigScheme,
  security: z.string(),
  security_config: securityConfigScheme,
  flow: nullableString,
});

const trojanScheme = z.object({
  port: portScheme,
  transport: z.string(),
  transport_config: transportConfigScheme,
  security: z.string(),
  security_config: securityConfigScheme,
});

const hysteria2Scheme = z.object({
  port: portScheme,
  hop_ports: nullableString,
  hop_interval: z.number().nullish(),
  obfs_password: nullableString,
  security: z.string(),
  security_config: securityConfigScheme,
});

const tuicScheme = z.object({
  port: portScheme,
  disable_sni: z.boolean().default(false),
  reduce_rtt: z.boolean().default(false),
  udp_relay_mode: z.string().default('native'),
  congestion_controller: z.string().default('bbr'),
  security_config: securityConfigScheme,
});

const anytlsScheme = z.object({
  port: portScheme,
  security_config: securityConfigScheme,
});

export const protocolConfigScheme = z.discriminatedUnion('protocol', [
  z.object({
    protocol: z.literal('shadowsocks'),
    enabled: z.boolean().default(false),
    config: shadowsocksScheme,
  }),
  z.object({
    protocol: z.literal('vmess'),
    enabled: z.boolean().default(false),
    config: vmessScheme,
  }),
  z.object({
    protocol: z.literal('vless'),
    enabled: z.boolean().default(false),
    config: vlessScheme,
  }),
  z.object({
    protocol: z.literal('trojan'),
    enabled: z.boolean().default(false),
    config: trojanScheme,
  }),
  z.object({
    protocol: z.literal('hysteria2'),
    enabled: z.boolean().default(false),
    config: hysteria2Scheme,
  }),
  z.object({
    protocol: z.literal('tuic'),
    enabled: z.boolean().default(false),
    config: tuicScheme,
  }),
  z.object({
    protocol: z.literal('anytls'),
    enabled: z.boolean().default(false),
    config: anytlsScheme,
  }),
]);

export const formScheme = z.object({
  name: z.string(),
  server_addr: z.string(),
  country: z.string().optional(),
  city: z.string().optional(),
  protocols: z.array(protocolConfigScheme).min(1),
});

export function getProtocolDefaultConfig(proto: (typeof protocols)[number]) {
  switch (proto) {
    case 'shadowsocks':
      return { method: 'chacha20-ietf-poly1305', port: null, server_key: null };
    case 'vmess':
      return {
        port: null,
        transport: 'tcp',
        transport_config: null,
        security: 'none',
        security_config: null,
      };
    case 'vless':
      return {
        port: null,
        transport: 'tcp',
        transport_config: null,
        security: 'none',
        security_config: null,
        flow: null,
      };
    case 'trojan':
      return {
        port: null,
        transport: 'tcp',
        transport_config: null,
        security: 'tls',
        security_config: {},
      };
    case 'hysteria2':
      return {
        port: null,
        hop_ports: null,
        hop_interval: null,
        obfs_password: null,
        security: 'tls',
        security_config: {},
      };
    case 'tuic':
      return {
        port: null,
        disable_sni: false,
        reduce_rtt: false,
        udp_relay_mode: 'native',
        congestion_controller: 'bbr',
        security_config: {},
      };
    case 'anytls':
      return { port: null, security_config: {} };
    default:
      return {} as any;
  }
}
