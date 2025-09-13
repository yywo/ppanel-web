import { z } from 'zod';

export const protocols = [
  'shadowsocks',
  'vmess',
  'vless',
  'trojan',
  'hysteria2',
  'tuic',
  'anytls',
  'socks',
  'naive',
  'http',
  'meru',
] as const;

export type FieldConfig = {
  name: string;
  type: 'input' | 'select' | 'switch' | 'number' | 'textarea';
  label: string;
  placeholder?: string | ((t: (key: string) => string, protocol: any) => string);
  options?: readonly string[];
  defaultValue?: any;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  condition?: (protocol: any, values: any) => boolean;
  group?: 'basic' | 'transport' | 'security' | 'reality' | 'plugin';
  gridSpan?: 1 | 2;
};

// Global label map for display; fallback to raw value if missing
export const LABELS = {
  // transport
  'tcp': 'TCP',
  'udp': 'UDP',
  'websocket': 'WebSocket',
  'grpc': 'gRPC',
  'mkcp': 'mKCP',
  'httpupgrade': 'HTTP Upgrade',
  'xhttp': 'XHTTP',
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
  // multiplex
  'off': 'Off',
  'low': 'Low',
  'middle': 'Middle',
  'high': 'High',
  // ss plugins
  'obfs': 'Simple Obfs',
  'v2ray-plugin': 'V2Ray Plugin',
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

export const SS_PLUGINS = ['none', 'obfs', 'v2ray-plugin'] as const;

export const TRANSPORTS = {
  vmess: ['tcp', 'websocket', 'grpc'] as const,
  vless: ['tcp', 'websocket', 'grpc', 'mkcp', 'httpupgrade', 'xhttp'] as const,
  trojan: ['tcp', 'websocket', 'grpc'] as const,
  meru: ['tcp', 'udp'] as const,
} as const;

export const SECURITY = {
  vmess: ['none', 'tls'] as const,
  vless: ['none', 'tls', 'reality'] as const,
  trojan: ['tls'] as const,
  hysteria2: ['tls'] as const,
  tuic: ['tls'] as const,
  anytls: ['tls'] as const,
  naive: ['none', 'tls'] as const,
  http: ['none', 'tls'] as const,
} as const;

export const FLOWS = {
  vless: ['none', 'xtls-rprx-direct', 'xtls-rprx-splice', 'xtls-rprx-vision'] as const,
} as const;

export const TUIC_UDP_RELAY_MODES = ['native', 'quic'] as const;
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

export const multiplexLevels = ['off', 'low', 'middle', 'high'] as const;

export function getLabel(value: string): string {
  const label = (LABELS as Record<string, string>)[value];
  return label ?? value.toUpperCase();
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
  plugin: z.enum(SS_PLUGINS as any).nullish(),
  plugin_opts: nullableString,
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
  security: z.enum(SECURITY.tuic as any).nullish(),
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
});

const anytls = z.object({
  type: z.literal('anytls'),
  port: nullablePort,
  security: z.enum(SECURITY.anytls as any).nullish(),
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
  padding_scheme: nullableString,
});

const socks = z.object({
  type: z.literal('socks'),
  port: nullablePort,
});

const naive = z.object({
  type: z.literal('naive'),
  port: nullablePort,
  security: z.enum(SECURITY.naive as any).nullish(),
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
});

const http = z.object({
  type: z.literal('http'),
  port: nullablePort,
  security: z.enum(SECURITY.http as any).nullish(),
  sni: nullableString,
  allow_insecure: nullableBool,
  fingerprint: nullableString,
});

const meru = z.object({
  type: z.literal('meru'),
  port: nullablePort,
  multiplex: z.enum(multiplexLevels).nullish(),
  transport: z.enum(TRANSPORTS.meru as any).nullish(),
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
  meru,
]);

export const formSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  country: z.string().optional(),
  city: z.string().optional(),
  ratio: z.number().default(1),
  protocols: z.array(protocolApiScheme),
});

export type ServerFormValues = z.infer<typeof formSchema>;

export type ProtocolType = (typeof protocols)[number];

export function getProtocolDefaultConfig(proto: ProtocolType) {
  switch (proto) {
    case 'shadowsocks':
      return {
        type: 'shadowsocks',
        port: null,
        cipher: 'chacha20-ietf-poly1305',
        server_key: null,
        plugin: 'none',
        plugin_opts: null,
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
        security: 'tls',
        sni: null,
        allow_insecure: false,
        fingerprint: 'chrome',
      } as any;
    case 'socks':
      return {
        type: 'socks',
        port: null,
      } as any;
    case 'naive':
      return {
        type: 'naive',
        port: null,
        security: 'none',
      } as any;
    case 'http':
      return {
        type: 'http',
        port: null,
        security: 'none',
      } as any;
    case 'meru':
      return {
        type: 'meru',
        port: null,
        multiplex: 'off',
        transport: 'tcp',
      } as any;
    case 'anytls':
      return {
        type: 'anytls',
        port: null,
        security: 'tls',
        padding_scheme: null,
        sni: null,
        allow_insecure: false,
        fingerprint: 'chrome',
      } as any;
    default:
      return {} as any;
  }
}

export const PROTOCOL_FIELDS: Record<string, FieldConfig[]> = {
  shadowsocks: [
    {
      name: 'port',
      type: 'number',
      label: 'port',
      min: 0,
      max: 65535,
      placeholder: '1-65535',
      group: 'basic',
    },
    {
      name: 'cipher',
      type: 'select',
      label: 'encryption_method',
      options: SS_CIPHERS,
      defaultValue: 'chacha20-ietf-poly1305',
      group: 'basic',
    },
    {
      name: 'server_key',
      type: 'input',
      label: 'server_key',
      group: 'basic',
      condition: (p) =>
        [
          '2022-blake3-aes-128-gcm',
          '2022-blake3-aes-256-gcm',
          '2022-blake3-chacha20-poly1305',
        ].includes(p.cipher),
    },
    {
      name: 'plugin',
      type: 'select',
      label: 'plugin',
      options: SS_PLUGINS,
      defaultValue: 'none',
      group: 'plugin',
    },
    {
      name: 'plugin_opts',
      type: 'textarea',
      label: 'plugin_opts',
      placeholder: (t: (key: string) => string, p: any) => {
        switch (p.plugin) {
          case 'obfs':
            return 'obfs=http;obfs-host=www.bing.com;path=/';
          case 'v2ray-plugin':
            return 'WebSocket: mode=websocket;host=mydomain.me;path=/;tls=true\n\nQUIC: mode=quic;host=mydomain.me';
          default:
            return 'key=value;key2=value2';
        }
      },
      group: 'plugin',
      condition: (p) => ['obfs', 'v2ray-plugin'].includes(p.plugin),
    },
  ],
  vmess: [
    {
      name: 'port',
      type: 'number',
      label: 'port',
      min: 0,
      max: 65535,
      placeholder: '1-65535',
      group: 'basic',
    },
    {
      name: 'transport',
      type: 'select',
      label: 'transport',
      options: TRANSPORTS.vmess,
      defaultValue: 'tcp',
      group: 'transport',
    },
    {
      name: 'security',
      type: 'select',
      label: 'security',
      options: SECURITY.vmess,
      defaultValue: 'none',
      group: 'security',
    },
    {
      name: 'host',
      type: 'input',
      label: 'host',
      group: 'transport',
      condition: (p) => ['websocket', 'xhttp', 'httpupgrade'].includes(p.transport),
    },
    {
      name: 'path',
      type: 'input',
      label: 'path',
      group: 'transport',
      condition: (p) => ['websocket', 'xhttp', 'httpupgrade'].includes(p.transport),
    },
    {
      name: 'service_name',
      type: 'input',
      label: 'service_name',
      group: 'transport',
      condition: (p) => p.transport === 'grpc',
    },
    {
      name: 'sni',
      type: 'input',
      label: 'security_sni',
      group: 'security',
      condition: (p) => p.security !== 'none',
    },
    {
      name: 'allow_insecure',
      type: 'switch',
      label: 'security_allow_insecure',
      group: 'security',
      condition: (p) => p.security !== 'none',
    },
    {
      name: 'fingerprint',
      type: 'select',
      label: 'security_fingerprint',
      options: FINGERPRINTS,
      defaultValue: 'chrome',
      group: 'security',
      condition: (p) => p.security !== 'none',
    },
  ],
  vless: [
    {
      name: 'port',
      type: 'number',
      label: 'port',
      min: 0,
      max: 65535,
      placeholder: '1-65535',
      group: 'basic',
    },
    {
      name: 'flow',
      type: 'select',
      label: 'flow',
      options: FLOWS.vless,
      defaultValue: 'none',
      group: 'basic',
    },
    {
      name: 'transport',
      type: 'select',
      label: 'transport',
      options: TRANSPORTS.vless,
      defaultValue: 'tcp',
      group: 'transport',
    },
    {
      name: 'security',
      type: 'select',
      label: 'security',
      options: SECURITY.vless,
      defaultValue: 'none',
      group: 'security',
    },
    {
      name: 'host',
      type: 'input',
      label: 'host',
      group: 'transport',
      condition: (p) => ['websocket', 'mkcp', 'httpupgrade', 'xhttp'].includes(p.transport),
    },
    {
      name: 'path',
      type: 'input',
      label: 'path',
      group: 'transport',
      condition: (p) => ['websocket', 'mkcp', 'httpupgrade', 'xhttp'].includes(p.transport),
    },
    {
      name: 'service_name',
      type: 'input',
      label: 'service_name',
      group: 'transport',
      condition: (p) => p.transport === 'grpc',
    },
    {
      name: 'sni',
      type: 'input',
      label: 'security_sni',
      group: 'security',
      condition: (p) => p.security !== 'none',
    },
    {
      name: 'allow_insecure',
      type: 'switch',
      label: 'security_allow_insecure',
      group: 'security',
      condition: (p) => p.security !== 'none',
    },
    {
      name: 'fingerprint',
      type: 'select',
      label: 'security_fingerprint',
      options: FINGERPRINTS,
      defaultValue: 'chrome',
      group: 'security',
      condition: (p) => p.security !== 'none',
    },
    {
      name: 'reality_server_addr',
      type: 'input',
      label: 'security_server_address',
      placeholder: (t) => t('security_server_address_placeholder'),
      group: 'reality',
      condition: (p) => p.security === 'reality',
    },
    {
      name: 'reality_server_port',
      type: 'number',
      label: 'security_server_port',
      min: 1,
      max: 65535,
      placeholder: '1-65535',
      group: 'reality',
      condition: (p) => p.security === 'reality',
    },
    {
      name: 'reality_private_key',
      type: 'input',
      label: 'security_private_key',
      placeholder: (t) => t('security_private_key_placeholder'),
      group: 'reality',
      condition: (p) => p.security === 'reality',
    },
    {
      name: 'reality_public_key',
      type: 'input',
      label: 'security_public_key',
      placeholder: (t) => t('security_public_key_placeholder'),
      group: 'reality',
      condition: (p) => p.security === 'reality',
    },
    {
      name: 'reality_short_id',
      type: 'input',
      label: 'security_short_id',
      group: 'reality',
      condition: (p) => p.security === 'reality',
    },
  ],
  trojan: [
    {
      name: 'port',
      type: 'number',
      label: 'port',
      min: 0,
      max: 65535,
      placeholder: '1-65535',
      group: 'basic',
    },
    {
      name: 'transport',
      type: 'select',
      label: 'transport',
      options: TRANSPORTS.trojan,
      defaultValue: 'tcp',
      group: 'transport',
    },
    {
      name: 'security',
      type: 'select',
      label: 'security',
      options: SECURITY.trojan,
      defaultValue: 'tls',
      group: 'security',
    },
    {
      name: 'host',
      type: 'input',
      label: 'host',
      group: 'transport',
      condition: (p) => ['websocket', 'xhttp', 'httpupgrade'].includes(p.transport),
    },
    {
      name: 'path',
      type: 'input',
      label: 'path',
      group: 'transport',
      condition: (p) => ['websocket', 'xhttp', 'httpupgrade'].includes(p.transport),
    },
    {
      name: 'service_name',
      type: 'input',
      label: 'service_name',
      group: 'transport',
      condition: (p) => p.transport === 'grpc',
    },
    {
      name: 'sni',
      type: 'input',
      label: 'security_sni',
      group: 'security',
      condition: (p) => p.security !== 'none',
    },
    {
      name: 'allow_insecure',
      type: 'switch',
      label: 'security_allow_insecure',
      group: 'security',
      condition: (p) => p.security !== 'none',
    },
    {
      name: 'fingerprint',
      type: 'select',
      label: 'security_fingerprint',
      options: FINGERPRINTS,
      defaultValue: 'chrome',
      group: 'security',
      condition: (p) => p.security !== 'none',
    },
  ],
  hysteria2: [
    {
      name: 'port',
      type: 'number',
      label: 'port',
      min: 0,
      max: 65535,
      placeholder: '1-65535',
      group: 'basic',
    },
    {
      name: 'obfs_password',
      type: 'input',
      label: 'obfs_password',
      placeholder: (t) => t('obfs_password_placeholder'),
      group: 'basic',
    },
    {
      name: 'hop_ports',
      type: 'input',
      label: 'hop_ports',
      placeholder: (t) => t('hop_ports_placeholder'),
      group: 'basic',
    },
    {
      name: 'hop_interval',
      type: 'number',
      label: 'hop_interval',
      min: 0,
      suffix: 'S',
      group: 'basic',
    },
    { name: 'sni', type: 'input', label: 'security_sni', group: 'security' },
    { name: 'allow_insecure', type: 'switch', label: 'security_allow_insecure', group: 'security' },
    {
      name: 'fingerprint',
      type: 'select',
      label: 'security_fingerprint',
      options: FINGERPRINTS,
      defaultValue: 'chrome',
      group: 'security',
    },
  ],
  tuic: [
    {
      name: 'port',
      type: 'number',
      label: 'port',
      min: 0,
      max: 65535,
      placeholder: '1-65535',
      group: 'basic',
    },
    {
      name: 'udp_relay_mode',
      type: 'select',
      label: 'udp_relay_mode',
      options: TUIC_UDP_RELAY_MODES,
      defaultValue: 'native',
      group: 'basic',
    },
    {
      name: 'congestion_controller',
      type: 'select',
      label: 'congestion_controller',
      options: TUIC_CONGESTION,
      defaultValue: 'bbr',
      group: 'basic',
    },
    { name: 'disable_sni', type: 'switch', label: 'disable_sni', group: 'basic' },
    { name: 'reduce_rtt', type: 'switch', label: 'reduce_rtt', group: 'basic' },
    { name: 'sni', type: 'input', label: 'security_sni', group: 'security' },
    { name: 'allow_insecure', type: 'switch', label: 'security_allow_insecure', group: 'security' },
    {
      name: 'fingerprint',
      type: 'select',
      label: 'security_fingerprint',
      options: FINGERPRINTS,
      defaultValue: 'chrome',
      group: 'security',
    },
  ],
  socks: [
    {
      name: 'port',
      type: 'number',
      label: 'port',
      min: 0,
      max: 65535,
      placeholder: '1-65535',
      group: 'basic',
    },
  ],
  naive: [
    {
      name: 'port',
      type: 'number',
      label: 'port',
      min: 0,
      max: 65535,
      placeholder: '1-65535',
      group: 'basic',
    },
    {
      name: 'security',
      type: 'select',
      label: 'security',
      options: SECURITY.naive,
      defaultValue: 'none',
      group: 'security',
    },
    {
      name: 'sni',
      type: 'input',
      label: 'security_sni',
      group: 'security',
      condition: (p) => p.security !== 'none',
    },
    {
      name: 'allow_insecure',
      type: 'switch',
      label: 'security_allow_insecure',
      group: 'security',
      condition: (p) => p.security !== 'none',
    },
    {
      name: 'fingerprint',
      type: 'select',
      label: 'security_fingerprint',
      options: FINGERPRINTS,
      defaultValue: 'chrome',
      group: 'security',
      condition: (p) => p.security !== 'none',
    },
  ],
  http: [
    {
      name: 'port',
      type: 'number',
      label: 'port',
      min: 0,
      max: 65535,
      placeholder: '1-65535',
      group: 'basic',
    },
    {
      name: 'security',
      type: 'select',
      label: 'security',
      options: SECURITY.http,
      defaultValue: 'none',
      group: 'security',
    },
    {
      name: 'sni',
      type: 'input',
      label: 'security_sni',
      group: 'security',
      condition: (p) => p.security !== 'none',
    },
    {
      name: 'allow_insecure',
      type: 'switch',
      label: 'security_allow_insecure',
      group: 'security',
      condition: (p) => p.security !== 'none',
    },
    {
      name: 'fingerprint',
      type: 'select',
      label: 'security_fingerprint',
      options: FINGERPRINTS,
      defaultValue: 'chrome',
      group: 'security',
      condition: (p) => p.security !== 'none',
    },
  ],
  meru: [
    {
      name: 'port',
      type: 'number',
      label: 'port',
      min: 0,
      max: 65535,
      placeholder: '1-65535',
      group: 'basic',
    },
    {
      name: 'multiplex',
      type: 'select',
      label: 'multiplex',
      options: multiplexLevels,
      defaultValue: 'off',
      group: 'basic',
    },
    {
      name: 'transport',
      type: 'select',
      label: 'transport',
      options: TRANSPORTS.meru,
      defaultValue: 'tcp',
      group: 'transport',
    },
  ],
  anytls: [
    {
      name: 'port',
      type: 'number',
      label: 'port',
      min: 0,
      max: 65535,
      placeholder: '1-65535',
      group: 'basic',
    },
    {
      name: 'padding_scheme',
      type: 'textarea',
      label: 'padding_scheme',
      placeholder: (t: (key: string) => string) => t('padding_scheme_placeholder'),
      group: 'basic',
    },
    { name: 'sni', type: 'input', label: 'security_sni', group: 'security' },
    { name: 'allow_insecure', type: 'switch', label: 'security_allow_insecure', group: 'security' },
    {
      name: 'fingerprint',
      type: 'select',
      label: 'security_fingerprint',
      options: FINGERPRINTS,
      defaultValue: 'chrome',
      group: 'security',
    },
  ],
};
