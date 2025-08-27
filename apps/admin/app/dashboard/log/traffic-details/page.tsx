'use client';

import { ProTable } from '@/components/pro-table';
import { filterTrafficLogDetails } from '@/services/admin/log';
import { formatBytes, formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

export default function TrafficDetailsPage() {
  const t = useTranslations('log');
  const sp = useSearchParams();
  const initialFilters = {
    search: sp.get('search') || undefined,
    date: sp.get('date') || undefined,
    server_id: sp.get('server_id') ? Number(sp.get('server_id')) : undefined,
    user_id: sp.get('user_id') ? Number(sp.get('user_id')) : undefined,
    subscribe_id: sp.get('subscribe_id') ? Number(sp.get('subscribe_id')) : undefined,
  };
  return (
    <ProTable<API.TrafficLogDetails, { search?: string }>
      header={{ title: t('title.trafficDetails') }}
      initialFilters={initialFilters}
      columns={[
        { accessorKey: 'server_id', header: t('column.serverId') },
        { accessorKey: 'user_id', header: t('column.userId') },
        { accessorKey: 'subscribe_id', header: t('column.subscribeId') },
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
          accessorKey: 'timestamp',
          header: t('column.time'),
          cell: ({ row }) => formatDate(row.original.timestamp),
        },
      ]}
      params={[
        { key: 'search' },
        { key: 'date', type: 'date' },
        { key: 'server_id', placeholder: t('column.serverId') },
        { key: 'user_id', placeholder: t('column.userId') },
        { key: 'subscribe_id', placeholder: t('column.subscribeId') },
      ]}
      request={async (pagination, filter) => {
        const { data } = await filterTrafficLogDetails({
          page: pagination.page,
          size: pagination.size,
          search: (filter as any)?.search,
          date: (filter as any)?.date,
          server_id: (filter as any)?.server_id,
          user_id: (filter as any)?.user_id,
          subscribe_id: (filter as any)?.subscribe_id,
        });
        const list = (data?.data?.list || []) as any[];
        const total = Number(data?.data?.total || list.length);
        return { list, total };
      }}
    />
  );
}
