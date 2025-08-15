'use client';

import { ProTable, ProTableActions } from '@/components/pro-table';
import {
  batchDeleteSubscribeGroup,
  createSubscribeGroup,
  deleteSubscribeGroup,
  getSubscribeGroupList,
  updateSubscribeGroup,
} from '@/services/admin/subscribe';
import { Button } from '@workspace/ui/components/button';
import { ConfirmButton } from '@workspace/ui/custom-components/confirm-button';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import GroupForm from './form';

const GroupTable = () => {
  const t = useTranslations('product');
  const [loading, setLoading] = useState(false);
  const ref = useRef<ProTableActions>(null);

  return (
    <ProTable<API.SubscribeGroup, any>
      action={ref}
      header={{
        title: t('group.title'),
        toolbar: (
          <GroupForm<API.CreateSubscribeGroupRequest>
            trigger={t('group.create')}
            title={t('group.createSubscribeGroup')}
            loading={loading}
            onSubmit={async (values) => {
              setLoading(true);
              try {
                await createSubscribeGroup(values);
                toast.success(t('group.createSuccess'));
                ref.current?.refresh();
                setLoading(false);

                return true;
              } catch (error) {
                setLoading(false);

                return false;
              }
            }}
          />
        ),
      }}
      columns={[
        {
          accessorKey: 'name',
          header: t('group.name'),
        },
        {
          accessorKey: 'description',
          header: t('group.description'),
        },
        {
          accessorKey: 'updated_at',
          header: t('group.updatedAt'),
          cell: ({ row }) => formatDate(row.getValue('updated_at')),
        },
      ]}
      request={async () => {
        const { data } = await getSubscribeGroupList();
        return {
          list: data.data?.list || [],
          total: data.data?.total || 0,
        };
      }}
      actions={{
        render: (row) => [
          <GroupForm<API.SubscribeGroup>
            key='edit'
            trigger={t('group.edit')}
            title={t('group.editSubscribeGroup')}
            loading={loading}
            initialValues={row}
            onSubmit={async (values) => {
              setLoading(true);
              try {
                await updateSubscribeGroup({
                  ...row,
                  ...values,
                });
                toast.success(t('group.updateSuccess'));
                ref.current?.refresh();
                setLoading(false);

                return true;
              } catch (error) {
                setLoading(false);

                return false;
              }
            }}
          />,
          <ConfirmButton
            key='delete'
            trigger={<Button variant='destructive'>{t('group.delete')}</Button>}
            title={t('group.confirmDelete')}
            description={t('group.deleteWarning')}
            onConfirm={async () => {
              await deleteSubscribeGroup({
                id: row.id,
              });
              toast.success(t('group.deleteSuccess'));
              ref.current?.refresh();
            }}
            cancelText={t('group.cancel')}
            confirmText={t('group.confirm')}
          />,
        ],
        batchRender(rows) {
          return [
            <ConfirmButton
              key='delete'
              trigger={<Button variant='destructive'>{t('group.delete')}</Button>}
              title={t('group.confirmDelete')}
              description={t('group.deleteWarning')}
              onConfirm={async () => {
                await batchDeleteSubscribeGroup({
                  ids: rows.map((item) => item.id),
                });
                toast.success(t('group.deleteSuccess'));
                ref.current?.refresh();
              }}
              cancelText={t('group.cancel')}
              confirmText={t('group.confirm')}
            />,
          ];
        },
      }}
    />
  );
};

export default GroupTable;
