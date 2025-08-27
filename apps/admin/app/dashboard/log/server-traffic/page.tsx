'use client';

import { ProTable } from '@/components/pro-table';
import { filterServerTrafficLog } from '@/services/admin/log';
import { formatBytes } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

export default function ServerTrafficLogPage() {
  const t = useTranslations('log');
  const sp = useSearchParams();
  const initialFilters = {
    search: sp.get('search') || undefined,
    date: sp.get('date') || undefined,
    server_id: sp.get('server_id') ? Number(sp.get('server_id')) : undefined,
  };
  return (
    <ProTable<API.ServerTrafficLog, { search?: string }>
      header={{ title: t('title.serverTraffic') }}
      initialFilters={initialFilters}
      columns={[
        { accessorKey: 'server_id', header: t('column.serverId') },
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
        { key: 'search' },
        { key: 'date', type: 'date' },
        { key: 'server_id', placeholder: t('column.serverId') },
      ]}
      request={async (pagination, filter) => {
        const { data } = await filterServerTrafficLog({
          page: pagination.page,
          size: pagination.size,
          search: filter?.search,
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
