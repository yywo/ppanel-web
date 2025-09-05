'use client';

import { ProTable } from '@/components/pro-table';
import { filterServerTrafficLog } from '@/services/admin/log';
import { filterServerList } from '@/services/admin/server';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { formatBytes } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ServerTrafficLogPage() {
  const t = useTranslations('log');
  const sp = useSearchParams();

  const today = new Date().toISOString().split('T')[0];

  const { data: servers = [] } = useQuery({
    queryKey: ['filterServerListAll'],
    queryFn: async () => {
      const { data } = await filterServerList({ page: 1, size: 999999999 });
      return data?.data?.list || [];
    },
  });

  const getServerName = (id?: number) =>
    id ? (servers.find((s) => s.id === id)?.name ?? `Server ${id}`) : 'Unknown';

  const initialFilters = {
    date: sp.get('date') || today,
    server_id: sp.get('server_id') ? Number(sp.get('server_id')) : undefined,
  };
  return (
    <ProTable<API.ServerTrafficLog, { date?: string; server_id?: number }>
      header={{ title: t('title.serverTraffic') }}
      initialFilters={initialFilters}
      actions={{
        render: (row) => [
          <Button key='detail' asChild>
            <Link
              href={`/dashboard/log/traffic-details?date=${row.date}&server_id=${row.server_id}`}
            >
              {t('detail')}
            </Link>
          </Button>,
        ],
      }}
      columns={[
        {
          accessorKey: 'server_id',
          header: t('column.server'),
          cell: ({ row }) => (
            <span>
              {getServerName(row.original.server_id)} ({row.original.server_id})
            </span>
          ),
        },
        {
          accessorKey: 'upload',
          header: t('column.upload'),
          cell: ({ row }) => formatBytes(row.original.upload),
        },
        {
          accessorKey: 'download',
          header: t('column.download'),
          cell: ({ row }) => formatBytes(row.original.download),
        },
        {
          accessorKey: 'total',
          header: t('column.total'),
          cell: ({ row }) => formatBytes(row.original.total),
        },
        { accessorKey: 'date', header: t('column.date') },
      ]}
      params={[
        { key: 'date', type: 'date' },
        { key: 'server_id', placeholder: t('column.serverId') },
      ]}
      request={async (pagination, filter) => {
        const { data } = await filterServerTrafficLog({
          page: pagination.page,
          size: pagination.size,
          date: (filter as any)?.date,
          server_id: (filter as any)?.server_id,
        });
        const list = (data?.data?.list || []) as any[];
        const total = Number(data?.data?.total || list.length);
        return { list, total };
      }}
    />
  );
}
