'use client';

import { UserDetail } from '@/app/dashboard/user/user-detail';
import { ProTable } from '@/components/pro-table';
import { filterUserSubscribeTrafficLog } from '@/services/admin/log';
import { formatBytes, formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';

export default function SubscribeTrafficLogPage() {
  const t = useTranslations('log');
  return (
    <ProTable<API.UserSubscribeTrafficLog, { search?: string }>
      header={{ title: t('title.subscribeTraffic') }}
      columns={[
        {
          accessorKey: 'user',
          header: t('column.user'),
          cell: ({ row }) => <UserDetail id={Number(row.original.user_id)} />,
        },
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
          accessorKey: 'total',
          header: t('column.total'),
          cell: ({ row }) => formatBytes(row.original.total),
        },
        {
          accessorKey: 'date',
          header: t('column.date'),
          cell: ({ row }) => formatDate(new Date(row.original.date)),
        },
      ]}
      params={[
        { key: 'search' },
        { key: 'date', type: 'date' },
        { key: 'user_id', placeholder: t('column.userId') },
        { key: 'user_subscribe_id', placeholder: t('column.subscribeId') },
      ]}
      request={async (pagination, filter) => {
        const { data } = await filterUserSubscribeTrafficLog({
          page: pagination.page,
          size: pagination.size,
          search: filter?.search,
          date: (filter as any)?.date,
          user_id: (filter as any)?.user_id,
          user_subscribe_id: (filter as any)?.user_subscribe_id,
        });
        const list = ((data?.data?.list || []) as API.UserSubscribeTrafficLog[]) || [];
        const total = Number(data?.data?.total || list.length);
        return { list, total };
      }}
    />
  );
}
