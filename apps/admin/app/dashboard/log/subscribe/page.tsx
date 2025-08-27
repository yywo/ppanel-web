'use client';

import { UserDetail } from '@/app/dashboard/user/user-detail';
import { IpLink } from '@/components/ip-link';
import { ProTable } from '@/components/pro-table';
import { filterSubscribeLog } from '@/services/admin/log';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

export default function SubscribeLogPage() {
  const t = useTranslations('log');
  const sp = useSearchParams();
  const initialFilters = {
    search: sp.get('search') || undefined,
    date: sp.get('date') || undefined,
    user_id: sp.get('user_id') ? Number(sp.get('user_id')) : undefined,
  };
  return (
    <ProTable<API.SubscribeLog, { search?: string }>
      header={{ title: t('title.subscribe') }}
      initialFilters={initialFilters}
      columns={[
        {
          accessorKey: 'user',
          header: t('column.user'),
          cell: ({ row }) => <UserDetail id={Number(row.original.user_id)} />,
        },
        { accessorKey: 'user_subscribe_id', header: t('column.subscribeId') },
        { accessorKey: 'token', header: t('column.token') },
        {
          accessorKey: 'client_ip',
          header: t('column.ip'),
          cell: ({ row }) => <IpLink ip={String((row.original as any).client_ip || '')} />,
        },
        { accessorKey: 'user_agent', header: t('column.userAgent') },
        {
          accessorKey: 'timestamp',
          header: t('column.time'),
          cell: ({ row }) => formatDate(row.original.timestamp),
        },
      ]}
      params={[
        { key: 'search' },
        { key: 'date', type: 'date' },
        { key: 'user_id', placeholder: t('column.userId') },
      ]}
      request={async (pagination, filter) => {
        const { data } = await filterSubscribeLog({
          page: pagination.page,
          size: pagination.size,
          search: filter?.search,
          date: (filter as any)?.date,
          user_id: (filter as any)?.user_id,
        });
        const list = (data?.data?.list || []) as any[];
        const total = Number(data?.data?.total || list.length);
        return { list, total };
      }}
    />
  );
}
