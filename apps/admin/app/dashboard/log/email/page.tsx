'use client';

import { ProTable } from '@/components/pro-table';
import { filterEmailLog } from '@/services/admin/log';
import { Badge } from '@workspace/ui/components/badge';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

export default function EmailLogPage() {
  const t = useTranslations('log');
  const sp = useSearchParams();
  const initialFilters = {
    search: sp.get('search') || undefined,
    date: sp.get('date') || undefined,
  };
  return (
    <ProTable<API.MessageLog, { search?: string }>
      header={{ title: t('title.email') }}
      initialFilters={initialFilters}
      columns={[
        {
          accessorKey: 'id',
          header: t('column.id'),
          cell: ({ row }) => <Badge>{row.getValue('id')}</Badge>,
        },
        { accessorKey: 'platform', header: t('column.platform') },
        { accessorKey: 'to', header: t('column.to') },
        { accessorKey: 'subject', header: t('column.subject') },
        {
          accessorKey: 'content',
          header: t('column.content'),
          cell: ({ row }) => (
            <pre className='max-w-[480px] overflow-auto whitespace-pre-wrap break-words text-xs'>
              {JSON.stringify(row.original.content || {}, null, 2)}
            </pre>
          ),
        },
        { accessorKey: 'status', header: t('column.status') },
        {
          accessorKey: 'created_at',
          header: t('column.time'),
          cell: ({ row }) => formatDate(row.original.created_at),
        },
      ]}
      params={[{ key: 'search' }, { key: 'date', type: 'date' }]}
      request={async (pagination, filter) => {
        const { data } = await filterEmailLog({
          page: pagination.page,
          size: pagination.size,
          search: filter?.search,
          date: (filter as any)?.date,
        });
        const list = ((data?.data?.list || []) as API.MessageLog[]) || [];
        const total = Number(data?.data?.total || list.length);
        return { list, total };
      }}
    />
  );
}
