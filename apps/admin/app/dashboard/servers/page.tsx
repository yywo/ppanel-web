'use client';
// Online users detail moved to separate component
import { ProTable, ProTableActions } from '@/components/pro-table';
import {
  createServer,
  deleteServer,
  filterServerList,
  hasMigrateSeverNode,
  migrateServerNode,
  resetSortWithServer,
  updateServer,
} from '@/services/admin/server';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { ConfirmButton } from '@workspace/ui/custom-components/confirm-button';
import { cn } from '@workspace/ui/lib/utils';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import OnlineUsersCell from './online-users-cell';
import ServerConfig from './server-config';
import ServerForm from './server-form';

type ProtocolName = 'shadowsocks' | 'vmess' | 'vless' | 'trojan' | 'hysteria2' | 'tuic' | 'anytls';

const PROTOCOL_COLORS: Record<ProtocolName, string> = {
  shadowsocks: 'bg-green-500',
  vmess: 'bg-rose-500',
  vless: 'bg-blue-500',
  trojan: 'bg-yellow-500',
  hysteria2: 'bg-purple-500',
  tuic: 'bg-cyan-500',
  anytls: 'bg-gray-500',
};

function PctBar({ value }: { value: number }) {
  const v = value.toFixed(2);
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
  ip?: string;
  t: (key: string) => string;
}) {
  const region = [country, city].filter(Boolean).join(' / ') || t('notAvailable');
  return (
    <div className='flex items-center gap-1'>
      <Badge variant='outline'>{region}</Badge>
      <Badge variant='outline'>{ip || t('notAvailable')}</Badge>
    </div>
  );
}

export default function ServersPage() {
  const t = useTranslations('servers');

  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const ref = useRef<ProTableActions>(null);

  const { data: hasMigrate, refetch: refetchHasMigrate } = useQuery({
    queryKey: ['hasMigrateSeverNode'],
    queryFn: async () => {
      const { data } = await hasMigrateSeverNode();
      return data.data?.has_migrate;
    },
  });

  const handleMigrate = async () => {
    setMigrating(true);
    try {
      const { data } = await migrateServerNode();
      const fail = data.data?.fail || 0;
      if (fail > 0) {
        toast.error(data.data?.message);
      } else {
        toast.success(t('migrated'));
      }
      refetchHasMigrate();
      ref.current?.refresh();
    } catch (error) {
      toast.error(t('migrateFailed'));
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className='space-y-4'>
      <Card>
        <CardContent className='p-4'>
          <ServerConfig />
        </CardContent>
      </Card>
      <ProTable<API.Server, { search: string }>
        action={ref}
        header={{
          title: t('pageTitle'),
          toolbar: (
            <div className='flex gap-2'>
              {hasMigrate && (
                <Button variant='outline' onClick={handleMigrate} disabled={migrating}>
                  {migrating ? t('migrating') : t('migrate')}
                </Button>
              )}
              <ServerForm
                trigger={t('create')}
                title={t('drawerCreateTitle')}
                loading={loading}
                onSubmit={async (values) => {
                  setLoading(true);
                  try {
                    await createServer(values as unknown as API.CreateServerRequest);
                    toast.success(t('created'));
                    ref.current?.refresh();
                    setLoading(false);
                    return true;
                  } catch (e) {
                    setLoading(false);
                    return false;
                  }
                }}
              />
            </div>
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
            header: t('address'),
            cell: ({ row }) => (
              <RegionIpCell
                country={row.original.country as unknown as string}
                city={row.original.city as unknown as string}
                ip={row.original.address as unknown as string}
                t={t}
              />
            ),
          },
          {
            accessorKey: 'protocols',
            header: t('protocols'),
            cell: ({ row }) => {
              const list = (row.original.protocols || []) as API.Protocol[];
              if (!list.length) return t('noData');
              return (
                <div className='flex flex-wrap gap-1'>
                  {list.map((p, idx) => {
                    const proto = ((p as any)?.type || '') as ProtocolName | '';
                    if (!proto) return null;
                    const color = PROTOCOL_COLORS[proto as ProtocolName];
                    const port = (p as any)?.port as number | undefined;
                    const label = `${proto}${port ? ` (${port})` : ''}`;
                    return (
                      <Badge
                        key={idx}
                        variant='outline'
                        className={cn('text-primary-foreground', color)}
                      >
                        {label}
                      </Badge>
                    );
                  })}
                </div>
              );
            },
          },

          {
            id: 'status',
            header: t('status'),
            cell: ({ row }) => {
              const offline = row.original.status.status === 'offline';
              return (
                <div className='flex items-center gap-2'>
                  <span
                    className={cn(
                      'inline-block h-2.5 w-2.5 rounded-full',
                      offline ? 'bg-zinc-400' : 'bg-emerald-500',
                    )}
                  />
                  <span className='text-sm'>{offline ? t('offline') : t('online')}</span>
                </div>
              );
            },
          },
          {
            id: 'cpu',
            header: t('cpu'),
            cell: ({ row }) => (
              <PctBar value={(row.original.status?.cpu as unknown as number) ?? 0} />
            ),
          },
          {
            id: 'mem',
            header: t('memory'),
            cell: ({ row }) => (
              <PctBar value={(row.original.status?.mem as unknown as number) ?? 0} />
            ),
          },
          {
            id: 'disk',
            header: t('disk'),
            cell: ({ row }) => (
              <PctBar value={(row.original.status?.disk as unknown as number) ?? 0} />
            ),
          },

          {
            id: 'online_users',
            header: t('onlineUsers'),
            cell: ({ row }) => <OnlineUsersCell status={row.original.status as API.ServerStatus} />,
          },
          {
            id: 'traffic_ratio',
            header: t('traffic_ratio'),
            cell: ({ row }) => {
              const raw = row.original.ratio as unknown;
              const ratio = Number(raw ?? 1) || 1;
              return <span className='text-sm'>{ratio.toFixed(2)}x</span>;
            },
          },
        ]}
        params={[{ key: 'search' }]}
        request={async (pagination, filter) => {
          const { data } = await filterServerList({
            page: pagination.page,
            size: pagination.size,
            search: filter?.search || undefined,
          });
          const list = (data?.data?.list || []) as API.Server[];
          const total = (data?.data?.total ?? list.length) as number;
          return { list, total };
        }}
        actions={{
          render: (row) => [
            <ServerForm
              key='edit'
              trigger={t('edit')}
              title={t('drawerEditTitle')}
              initialValues={row as any}
              loading={loading}
              onSubmit={async (values) => {
                setLoading(true);
                try {
                  // ServerForm already returns API-shaped body; add id for update
                  await updateServer({
                    id: row.id,
                    ...(values as unknown as Omit<API.UpdateServerRequest, 'id'>),
                  });
                  toast.success(t('updated'));
                  ref.current?.refresh();
                  setLoading(false);
                  return true;
                } catch (e) {
                  setLoading(false);
                  return false;
                }
              }}
            />,
            <ConfirmButton
              key='delete'
              trigger={<Button variant='destructive'>{t('delete')}</Button>}
              title={t('confirmDeleteTitle')}
              description={t('confirmDeleteDesc')}
              onConfirm={async () => {
                await deleteServer({ id: row.id } as any);
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
                const { id, created_at, updated_at, last_reported_at, status, ...others } =
                  row as any;
                const body: API.CreateServerRequest = {
                  name: others.name,
                  country: others.country,
                  city: others.city,
                  ratio: others.ratio,
                  address: others.address,
                  protocols: others.protocols || [],
                };
                await createServer(body);
                toast.success(t('copied'));
                ref.current?.refresh();
                setLoading(false);
              }}
            >
              {t('copy')}
            </Button>,
          ],
          batchRender(rows) {
            return [
              <ConfirmButton
                key='delete'
                trigger={<Button variant='destructive'>{t('delete')}</Button>}
                title={t('confirmDeleteTitle')}
                description={t('confirmDeleteDesc')}
                onConfirm={async () => {
                  await Promise.all(rows.map((r) => deleteServer({ id: r.id })));
                  toast.success(t('deleted'));
                  ref.current?.refresh();
                }}
                cancelText={t('cancel')}
                confirmText={t('confirm')}
              />,
            ];
          },
        }}
        onSort={async (source, target, items) => {
          const sourceIndex = items.findIndex((item) => String(item.id) === source);
          const targetIndex = items.findIndex((item) => String(item.id) === target);

          const originalSorts = items.map((item) => item.sort);

          const [movedItem] = items.splice(sourceIndex, 1);
          items.splice(targetIndex, 0, movedItem!);

          const updatedItems = items.map((item, index) => {
            const originalSort = originalSorts[index];
            const newSort = originalSort !== undefined ? originalSort : item.sort;
            return { ...item, sort: newSort };
          });

          const changedItems = updatedItems.filter((item, index) => {
            return item.sort !== items[index]?.sort;
          });

          if (changedItems.length > 0) {
            resetSortWithServer({
              sort: changedItems.map((item) => ({
                id: item.id,
                sort: item.sort,
              })) as API.SortItem[],
            });
            toast.success(t('sorted_success'));
          }
          return updatedItems;
        }}
      />
    </div>
  );
}
