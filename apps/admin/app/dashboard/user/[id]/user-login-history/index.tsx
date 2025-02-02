'use client';

import { ProTable } from '@/components/pro-table';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export default function UserLoginHistory() {
  const t = useTranslations('user');
  const { id } = useParams<{ id: string }>();

  return (
    <ProTable<
      {
        ip: string;
        user_agent: string;
        created_at: string;
      },
      Record<string, unknown>
    >
      columns={[
        {
          accessorKey: 'ip',
          header: t('loginIp'),
        },
        {
          accessorKey: 'user_agent',
          header: t('userAgent'),
        },
        {
          accessorKey: 'created_at',
          header: t('loginTime'),
          cell: ({ row }) => formatDate(row.getValue('created_at')),
        },
      ]}
      params={[
        {
          key: 'search',
          placeholder: t('searchIp'),
        },
      ]}
      request={async (pagination, filter) => {
        return {
          list: [],
          total: 0,
        };
      }}
    />
  );
}
