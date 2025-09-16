import type { ProtocolType } from './types';

export function getProtocolDefaultConfig(proto: ProtocolType) {
  switch (proto) {
    case 'shadowsocks':
      return {
        type: 'shadowsocks',
        port: null,
        cipher: 'chacha20-ietf-poly1305',
        server_key: null,
        obfs: 'none',
        obfs_host: null,
        obfs_path: null,
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
        obfs: 'none',
        obfs_password: null,
        security: 'tls',
        up_mbps: null,
        down_mbps: null,
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
    case 'mieru':
      return {
        type: 'mieru',
        port: null,
        multiplex: 'none',
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
