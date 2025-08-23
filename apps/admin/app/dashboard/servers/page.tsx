'use client';
import { UserDetail } from '@/app/dashboard/user/user-detail';
import { IpLink } from '@/components/ip-link';
import { ProTable, ProTableActions } from '@/components/pro-table';
import { getUserSubscribeById } from '@/services/admin/user';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@workspace/ui/components/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { ConfirmButton } from '@workspace/ui/custom-components/confirm-button';
import { cn } from '@workspace/ui/lib/utils';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import ServerConfig from './server-config';
import ServerForm from './server-form';

type ProtocolName = 'shadowsocks' | 'vmess' | 'vless' | 'trojan' | 'hysteria2' | 'tuic' | 'anytls';
type ProtocolEntry = { protocol: ProtocolName; enabled: boolean; config: Record<string, unknown> };

interface ServerFormFields {
  name: string;
  server_addr: string;
  country?: string;
  city?: string;
  protocols: ProtocolEntry[];
}

type ServerStatus = {
  online?: unknown;
  cpu?: number;
  mem?: number;
  disk?: number;
  updated_at?: number;
};

type ServerItem = ServerFormFields & { id: number; status?: ServerStatus; [key: string]: unknown };

const mockList: ServerItem[] = [
  {
    id: 1,
    name: 'Server A',
    server_addr: '1.1.1.1',
    country: 'US',
    city: 'SFO',
    protocols: [
      {
        protocol: 'shadowsocks',
        enabled: true,
        config: { method: 'aes-128-gcm', port: 443, server_key: null },
      },
      {
        protocol: 'trojan',
        enabled: true,
        config: { port: 8443, transport: 'tcp', security: 'tls' },
      },
      {
        protocol: 'vmess',
        enabled: false,
        config: {
          port: 1443,
          transport: 'websocket',
          transport_config: { path: '/ws', host: 'example.com' },
          security: 'tls',
        },
      },
    ],
    status: {
      online: { 1001: ['1.2.3.4'], 1002: ['5.6.7.8', '9.9.9.9'] },
      cpu: 34,
      mem: 62,
      disk: 48,
      updated_at: Date.now() / 1000,
    },
  },
  {
    id: 2,
    name: 'Server B',
    server_addr: '2.2.2.2',
    country: 'JP',
    city: 'Tokyo',
    protocols: [
      {
        protocol: 'vmess',
        enabled: true,
        config: { port: 2443, transport: 'tcp', security: 'none' },
      },
      {
        protocol: 'hysteria2',
        enabled: true,
        config: { port: 3443, hop_ports: '443,8443,10443', hop_interval: 15, security: 'tls' },
      },
      { protocol: 'tuic', enabled: false, config: { port: 4443 } },
    ],
    status: {
      online: { 2001: ['10.0.0.1'] },
      cpu: 72,
      mem: 81,
      disk: 67,
      updated_at: Date.now() / 1000,
    },
  },
  {
    id: 3,
    name: 'Server C',
    server_addr: '3.3.3.3',
    country: 'DE',
    city: 'FRA',
    protocols: [
      { protocol: 'anytls', enabled: true, config: { port: 80 } },
      {
        protocol: 'shadowsocks',
        enabled: false,
        config: { method: 'chacha20-ietf-poly1305', port: 8080 },
      },
    ],
    status: { online: {}, cpu: 0, mem: 0, disk: 0, updated_at: 0 },
  },
];

let mockData: ServerItem[] = [...mockList];
const getServerList = async () => ({ list: mockData, total: mockData.length });
const createServer = async (values: Omit<ServerItem, 'id'>) => {
  mockData.push({
    id: Date.now(),
    name: '',
    server_addr: '',
    protocols: [],
    ...values,
  });
  return true;
};
const updateServer = async (id: number, values: Omit<ServerItem, 'id'>) => {
  mockData = mockData.map((i) => (i.id === id ? { ...i, ...values } : i));
  return true;
};
const deleteServer = async (id: number) => {
  mockData = mockData.filter((i) => i.id !== id);
  return true;
};

const PROTOCOL_COLORS: Record<ProtocolName, string> = {
  shadowsocks: 'bg-green-500',
  vmess: 'bg-rose-500',
  vless: 'bg-blue-500',
  trojan: 'bg-yellow-500',
  hysteria2: 'bg-purple-500',
  tuic: 'bg-cyan-500',
  anytls: 'bg-gray-500',
};

function getEnabledProtocols(p: ServerItem['protocols']) {
  return Array.isArray(p) ? p.filter((x) => x.enabled) : [];
}

function ProtocolBadge({
  item,
  t,
}: {
  item: ServerItem['protocols'][number];
  t: (key: string) => string;
}) {
  const color = PROTOCOL_COLORS[item.protocol];
  const port = (item?.config as any)?.port as number | undefined;
  const extra: string[] = [];
  if ((item.config as any)?.transport) extra.push(String((item.config as any).transport));
  if ((item.config as any)?.security && (item.config as any).security !== 'none')
    extra.push(String((item.config as any).security));
  const label = `${item.protocol}${port ? ` (${port})` : ''}`;
  const tipParts = [label, extra.length ? `· ${extra.join(' / ')}` : ''].filter(Boolean);
  const tooltip = tipParts.join(' ');
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant='outline' className={cn('text-primary-foreground', color)}>
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{tooltip || t('notAvailable')}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function PctBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className='min-w-24'>
      <div className='text-xs leading-none'>{v}%</div>
      <div className='bg-muted h-1.5 w-full rounded'>
        <div className='bg-primary h-1.5 rounded' style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

function RegionIpCell({
  country,
  city,
  ip,
  t,
}: {
  country?: string;
  city?: string;
  ip: string;
  t: (key: string) => string;
}) {
  const region = [country, city].filter(Boolean).join(' / ') || t('notAvailable');
  return (
    <div className='flex items-center gap-1'>
      <Badge variant='outline'>{region}</Badge>
      <Badge variant='outline'>{ip}</Badge>
    </div>
  );
}

function UserSubscribeInfo({
  userId,
  type,
  t,
}: {
  userId: number;
  type: 'account' | 'subscribeName' | 'subscribeId' | 'traffic' | 'expireTime';
  t: (key: string) => string;
}) {
  const { data } = useQuery({
    enabled: userId !== 0,
    queryKey: ['getUserSubscribeById', userId],
    queryFn: async () => {
      const { data } = await getUserSubscribeById({ id: userId });
      return data.data;
    },
  });
  if (!data) return <span className='text-muted-foreground'>--</span>;
  if (type === 'account')
    return data.user_id ? (
      <UserDetail id={data.user_id} />
    ) : (
      <span className='text-muted-foreground'>--</span>
    );
  if (type === 'subscribeName')
    return data.subscribe?.name ? (
      <span className='text-sm'>{data.subscribe.name}</span>
    ) : (
      <span className='text-muted-foreground'>--</span>
    );
  if (type === 'subscribeId')
    return data.id ? (
      <span className='font-mono text-sm'>{data.id}</span>
    ) : (
      <span className='text-muted-foreground'>--</span>
    );
  if (type === 'traffic') {
    const used = (data.upload || 0) + (data.download || 0);
    const total = data.traffic || 0;
    return (
      <div className='min-w-0 text-sm'>{`${(used / 1024 ** 3).toFixed(2)} GB / ${total > 0 ? (total / 1024 ** 3).toFixed(2) + ' GB' : t('unlimited')}`}</div>
    );
  }
  if (type === 'expireTime') {
    if (!data.expire_time) return <span className='text-muted-foreground'>--</span>;
    const expired = data.expire_time < Date.now() / 1000;
    return (
      <div className='flex items-center gap-2'>
        <span className='text-sm'>{new Date((data.expire_time || 0) * 1000).toLocaleString()}</span>
        {expired && (
          <Badge variant='destructive' className='w-fit px-1 py-0 text-xs'>
            {t('expired')}
          </Badge>
        )}
      </div>
    );
  }
  return <span className='text-muted-foreground'>--</span>;
}

function normalizeOnlineMap(online: unknown): { uid: string; ips: string[] }[] {
  if (!online || typeof online !== 'object' || Array.isArray(online)) return [];
  const m = online as Record<string, unknown>;
  const rows = Object.entries(m).map(([uid, ips]) => {
    if (Array.isArray(ips)) return { uid, ips: (ips as unknown[]).map(String) };
    if (typeof ips === 'string') return { uid, ips: [ips] };
    const o = ips as Record<string, unknown>;
    if (Array.isArray(o?.ips)) return { uid, ips: (o.ips as unknown[]).map(String) };
    return { uid, ips: [] };
  });
  return rows.filter((r) => r.ips.length > 0);
}

function OnlineUsersCell({ status, t }: { status?: ServerStatus; t: (key: string) => string }) {
  const [open, setOpen] = useState(false);
  const rows = normalizeOnlineMap(status?.online);
  const count = rows.length;
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className='hover:text-foreground text-muted-foreground flex items-center gap-2 bg-transparent p-0 text-sm'>
          <Badge variant='secondary'>{count}</Badge>
          <span>{t('onlineUsers')}</span>
        </button>
      </SheetTrigger>
      <SheetContent className='sm:w=[900px] h-screen w-screen max-w-none sm:h-auto sm:max-w-[90vw]'>
        <SheetHeader>
          <SheetTitle>{t('onlineUsers')}</SheetTitle>
        </SheetHeader>
        <div className='-mx-6 h-[calc(100vh-48px-16px)] overflow-y-auto px-6 py-4 sm:h-[calc(100dvh-48px-16px-env(safe-area-inset-top))]'>
          <ProTable<
            {
              uid: string;
              ips: string[];
            },
            Record<string, unknown>
          >
            header={{ hidden: true }}
            columns={[
              {
                accessorKey: 'ips',
                header: t('ipAddresses'),
                cell: ({ row }) => {
                  const ips = row.original.ips;
                  return (
                    <div className='flex min-w-0 flex-col gap-1'>
                      {ips.map((ip, i) => (
                        <div
                          key={`${row.original.uid}-${ip}`}
                          className='whitespace-nowrap text-sm'
                        >
                          {i === 0 ? (
                            <IpLink ip={ip} className='font-medium' />
                          ) : (
                            <IpLink ip={ip} className='text-muted-foreground' />
                          )}
                        </div>
                      ))}
                    </div>
                  );
                },
              },
              {
                accessorKey: 'user',
                header: t('user'),
                cell: ({ row }) => (
                  <UserSubscribeInfo userId={Number(row.original.uid)} type='account' t={t} />
                ),
              },
              {
                accessorKey: 'subscription',
                header: t('subscription'),
                cell: ({ row }) => (
                  <UserSubscribeInfo userId={Number(row.original.uid)} type='subscribeName' t={t} />
                ),
              },
              {
                accessorKey: 'subscribeId',
                header: t('subscribeId'),
                cell: ({ row }) => (
                  <UserSubscribeInfo userId={Number(row.original.uid)} type='subscribeId' t={t} />
                ),
              },
              {
                accessorKey: 'traffic',
                header: t('traffic'),
                cell: ({ row }) => (
                  <UserSubscribeInfo userId={Number(row.original.uid)} type='traffic' t={t} />
                ),
              },
              {
                accessorKey: 'expireTime',
                header: t('expireTime'),
                cell: ({ row }) => (
                  <UserSubscribeInfo userId={Number(row.original.uid)} type='expireTime' t={t} />
                ),
              },
            ]}
            request={async () => ({ list: rows, total: rows.length })}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function ServersPage() {
  const t = useTranslations('servers');

  const [loading, setLoading] = useState(false);
  const ref = useRef<ProTableActions>(null);

  return (
    <div className='space-y-4'>
      <Card>
        <CardContent className='p-4'>
          <ServerConfig />
        </CardContent>
      </Card>
      <ProTable<ServerItem, { search: string }>
        action={ref}
        header={{
          title: t('pageTitle'),
          toolbar: (
            <ServerForm
              trigger={t('create')}
              title={t('drawerCreateTitle')}
              loading={loading}
              onSubmit={async (values) => {
                setLoading(true);
                await createServer(values as any);
                toast.success(t('created'));
                ref.current?.refresh();
                setLoading(false);
                return true;
              }}
            />
          ),
        }}
        columns={[
          {
            accessorKey: 'id',
            header: t('id'),
            cell: ({ row }) => <Badge>{row.getValue('id')}</Badge>,
          },
          { accessorKey: 'name', header: t('name') },
          {
            id: 'region_ip',
            header: t('serverAddress'),
            cell: ({ row }) => (
              <RegionIpCell
                country={row.original.country as string}
                city={row.original.city as string}
                ip={row.original.server_addr as string}
                t={t}
              />
            ),
          },
          {
            accessorKey: 'protocols',
            header: t('protocols'),
            cell: ({ row }) => {
              const enabled = getEnabledProtocols(row.original.protocols);
              if (!enabled.length) return t('noData');
              return (
                <div className='flex flex-wrap gap-1'>
                  {enabled.map((p, idx) => (
                    <ProtocolBadge key={idx} item={p} t={t} />
                  ))}
                </div>
              );
            },
          },
          {
            id: 'status',
            header: t('status'),
            cell: ({ row }) => {
              const s = (row.original.status ?? {}) as ServerStatus;
              const on = !!(
                s.online &&
                typeof s.online === 'object' &&
                !Array.isArray(s.online) &&
                Object.keys(s.online as Record<string, unknown>).length
              );
              return (
                <div className='flex items-center gap-2'>
                  <span
                    className={cn(
                      'inline-block h-2.5 w-2.5 rounded-full',
                      on ? 'bg-emerald-500' : 'bg-zinc-400',
                    )}
                  />
                  <span className='text-sm'>{on ? t('online') : t('offline')}</span>
                </div>
              );
            },
          },
          {
            id: 'cpu',
            header: t('cpu'),
            cell: ({ row }) => <PctBar value={(row.original.status?.cpu as number) ?? 0} />,
          },
          {
            id: 'mem',
            header: t('memory'),
            cell: ({ row }) => <PctBar value={(row.original.status?.mem as number) ?? 0} />,
          },
          {
            id: 'disk',
            header: t('disk'),
            cell: ({ row }) => <PctBar value={(row.original.status?.disk as number) ?? 0} />,
          },
          {
            id: 'online_users',
            header: t('onlineUsers'),
            cell: ({ row }) => (
              <OnlineUsersCell status={row.original.status as ServerStatus} t={t} />
            ),
          },
        ]}
        params={[{ key: 'search' }]}
        request={async (_pagination, filter) => {
          const { list } = await getServerList();
          const keyword = (filter?.search || '').toLowerCase().trim();
          const filtered = keyword
            ? list.filter((item) =>
                [item.name, item.server_addr, item.country, item.city]
                  .filter(Boolean)
                  .some((v) => String(v).toLowerCase().includes(keyword)),
              )
            : list;
          return { list: filtered, total: filtered.length };
        }}
        actions={{
          render: (row) => [
            <ServerForm
              key='edit'
              trigger={t('edit')}
              title={t('drawerEditTitle')}
              initialValues={{
                name: row.name as string,
                server_addr: row.server_addr as string,
                country: (row as any).country,
                city: (row as any).city,
                protocols: (row as ServerItem).protocols,
              }}
              loading={loading}
              onSubmit={async (values) => {
                setLoading(true);
                await updateServer(row.id as number, values as any);
                toast.success(t('updated'));
                ref.current?.refresh();
                setLoading(false);
                return true;
              }}
            />,
            <ConfirmButton
              key='delete'
              trigger={<Button variant='destructive'>{t('delete')}</Button>}
              title={t('confirmDeleteTitle')}
              description={t('confirmDeleteDesc')}
              onConfirm={async () => {
                await deleteServer(row.id as number);
                toast.success(t('deleted'));
                ref.current?.refresh();
              }}
              cancelText={t('cancel')}
              confirmText={t('confirm')}
            />,
            <Button
              key='copy'
              variant='outline'
              onClick={async () => {
                setLoading(true);
                const { id, ...others } = row as ServerItem;
                await createServer(others as any);
                toast.success(t('copied'));
                ref.current?.refresh();
                setLoading(false);
              }}
            >
              {t('copy')}
            </Button>,
          ],
        }}
      />
    </div>
  );
}
