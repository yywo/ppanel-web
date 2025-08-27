'use client';

import { UserDetail } from '@/app/dashboard/user/user-detail';
import { IpLink } from '@/components/ip-link';
import { ProTable } from '@/components/pro-table';
import { filterRegisterLog } from '@/services/admin/log';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

export default function RegisterLogPage() {
  const t = useTranslations('log');
  const sp = useSearchParams();
  const initialFilters = {
    search: sp.get('search') || undefined,
    date: sp.get('date') || undefined,
    user_id: sp.get('user_id') ? Number(sp.get('user_id')) : undefined,
  };
  return (
    <ProTable<API.RegisterLog, { search?: string }>
      header={{ title: t('title.register') }}
      initialFilters={initialFilters}
      columns={[
        {
          accessorKey: 'user',
          header: t('column.user'),
          cell: ({ row }) => <UserDetail id={Number(row.original.user_id)} />,
        },
        { accessorKey: 'auth_method', header: t('column.method') },
        { accessorKey: 'identifier', header: t('column.identifier') },
        {
          accessorKey: 'register_ip',
          header: t('column.ip'),
          cell: ({ row }) => <IpLink ip={String((row.original as any).register_ip || '')} />,
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
        const { data } = await filterRegisterLog({
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
