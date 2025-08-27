'use client';

import { UserDetail } from '@/app/dashboard/user/user-detail';
import { ProTable } from '@/components/pro-table';
import { filterResetSubscribeLog } from '@/services/admin/log';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

export default function ResetSubscribeLogPage() {
  const t = useTranslations('log');
  const sp = useSearchParams();
  const initialFilters = {
    search: sp.get('search') || undefined,
    date: sp.get('date') || undefined,
    user_subscribe_id: sp.get('user_subscribe_id')
      ? Number(sp.get('user_subscribe_id'))
      : undefined,
  };
  return (
    <ProTable<API.ResetSubscribeLog, { search?: string }>
      header={{ title: t('title.resetSubscribe') }}
      initialFilters={initialFilters}
      columns={[
        {
          accessorKey: 'user',
          header: t('column.user'),
          cell: ({ row }) => <UserDetail id={Number(row.original.user_id)} />,
        },
        { accessorKey: 'user_subscribe_id', header: t('column.subscribeId') },
        { accessorKey: 'type', header: t('column.type') },
        { accessorKey: 'order_no', header: t('column.orderNo') },
        {
          accessorKey: 'timestamp',
          header: t('column.time'),
          cell: ({ row }) => formatDate(row.original.timestamp),
        },
      ]}
      params={[
        { key: 'search' },
        { key: 'date', type: 'date' },
        { key: 'user_subscribe_id', placeholder: t('column.subscribeId') },
      ]}
      request={async (pagination, filter) => {
        const { data } = await filterResetSubscribeLog({
          page: pagination.page,
          size: pagination.size,
          search: filter?.search,
          date: (filter as any)?.date,
          user_subscribe_id: (filter as any)?.user_subscribe_id,
        });
        const list = (data?.data?.list || []) as any[];
        const total = Number(data?.data?.total || list.length);
        return { list, total };
      }}
    />
  );
}
