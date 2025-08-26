'use client';

import { UserDetail } from '@/app/dashboard/user/user-detail';
import { IpLink } from '@/components/ip-link';
import { ProTable } from '@/components/pro-table';
import { filterServerList } from '@/services/admin/server';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@workspace/ui/components/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@workspace/ui/components/sheet';
import type { useTranslations } from 'next-intl';
import { useState } from 'react';

function mapOnlineUsers(online: API.ServerStatus['online'] = []): {
  uid: string;
  ips: string[];
  subscribe?: string;
  subscribe_id?: number;
  traffic?: number;
  expired_at?: number;
}[] {
  return (online || []).map((u) => ({
    uid: String(u.user_id || ''),
    ips: Array.isArray(u.ip) ? u.ip.map(String) : [],
    subscribe: (u as any).subscribe,
    subscribe_id: (u as any).subscribe_id,
    traffic: (u as any).traffic,
    expired_at: (u as any).expired_at,
  }));
}

export default function OnlineUsersCell({
  serverId,
  status,
  t,
}: {
  serverId?: number;
  status?: API.ServerStatus;
  t: ReturnType<typeof useTranslations>;
}) {
  const [open, setOpen] = useState(false);

  const { data: latest } = useQuery({
    queryKey: ['serverStatusById', serverId, open],
    enabled: !!serverId && open,
    queryFn: async () => {
      const { data } = await filterServerList({ page: 1, size: 1, search: String(serverId) });
      const list = (data?.data?.list || []) as API.Server[];
      return list[0]?.status as API.ServerStatus | undefined;
    },
  });

  const rows = mapOnlineUsers((latest || status)?.online);
  const count = rows.length;
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className='hover:text-foreground text-muted-foreground flex items-center gap-2 bg-transparent p-0 text-sm'>
          <Badge variant='secondary'>{count}</Badge>
          <span>{t('onlineUsers')}</span>
        </button>
      </SheetTrigger>
      <SheetContent className='h-screen w-screen max-w-none sm:h-auto sm:w-[900px] sm:max-w-[90vw]'>
        <SheetHeader>
          <SheetTitle>{t('onlineUsers')}</SheetTitle>
        </SheetHeader>
        <div className='-mx-6 h-[calc(100vh-48px-16px)] overflow-y-auto px-6 py-4 sm:h-[calc(100dvh-48px-16px-env(safe-area-inset-top))]'>
          <ProTable<
            {
              uid: string;
              ips: string[];
              subscribe?: string;
              subscribe_id?: number;
              traffic?: number;
              expired_at?: number;
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
                cell: ({ row }) => <UserDetail id={Number(row.original.uid)} />,
              },
              {
                accessorKey: 'subscription',
                header: t('subscription'),
                cell: ({ row }) => (
                  <span className='text-sm'>{row.original.subscribe || '--'}</span>
                ),
              },
              {
                accessorKey: 'subscribeId',
                header: t('subscribeId'),
                cell: ({ row }) => (
                  <span className='font-mono text-sm'>{row.original.subscribe_id || '--'}</span>
                ),
              },
              {
                accessorKey: 'traffic',
                header: t('traffic'),
                cell: ({ row }) => {
                  const v = Number(row.original.traffic || 0);
                  return <span className='text-sm'>{(v / 1024 ** 3).toFixed(2)} GB</span>;
                },
              },
              {
                accessorKey: 'expireTime',
                header: t('expireTime'),
                cell: ({ row }) => {
                  const ts = Number(row.original.expired_at || 0);
                  if (!ts) return <span className='text-muted-foreground'>--</span>;
                  const expired = ts < Date.now() / 1000;
                  return (
                    <div className='flex items-center gap-2'>
                      <span className='text-sm'>{new Date(ts * 1000).toLocaleString()}</span>
                      {expired && (
                        <Badge variant='destructive' className='w-fit px-1 py-0 text-xs'>
                          {t('expired')}
                        </Badge>
                      )}
                    </div>
                  );
                },
              },
            ]}
            request={async () => ({ list: rows, total: rows.length })}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
