'use client';

import { ProTable, ProTableActions } from '@/components/pro-table';
import {
  createNode,
  deleteNode,
  filterNodeList,
  filterServerList,
  toggleNodeStatus,
  updateNode,
} from '@/services/admin/server';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Switch } from '@workspace/ui/components/switch';
import { ConfirmButton } from '@workspace/ui/custom-components/confirm-button';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import NodeForm from './node-form';

export default function NodesPage() {
  const t = useTranslations('nodes');
  const ref = useRef<ProTableActions>(null);
  const [loading, setLoading] = useState(false);

  const { data: servers = [] } = useQuery({
    queryKey: ['filterServerListAll', { page: 1, size: 1000 }],
    queryFn: async () => {
      const { data } = await filterServerList({ page: 1, size: 1000 });
      return data?.data?.list || [];
    },
  });

  const getServerName = (id?: number) =>
    id ? (servers.find((s) => s.id === id)?.name ?? `#${id}`) : '—';
  const getServerOriginAddr = (id?: number) =>
    id ? (servers.find((s) => s.id === id)?.address ?? '—') : '—';
  const getProtocolOriginPort = (id?: number, proto?: string) => {
    if (!id || !proto) return '—';
    const hit = servers.find((s) => s.id === id)?.protocols?.find((p) => (p as any).type === proto);
    const p = (hit as any)?.port as number | undefined;
    return typeof p === 'number' ? String(p) : '—';
  };

  return (
    <ProTable<API.Node, { search: string }>
      action={ref}
      header={{
        title: t('pageTitle'),
        toolbar: (
          <NodeForm
            trigger={t('create')}
            title={t('drawerCreateTitle')}
            loading={loading}
            onSubmit={async (values) => {
              setLoading(true);
              try {
                const body: API.CreateNodeRequest = {
                  name: values.name,
                  server_id: Number(values.server_id!),
                  protocol: values.protocol,
                  address: values.address,
                  port: Number(values.port!),
                  tags: values.tags || [],
                  enabled: false,
                };
                await createNode(body);
                toast.success(t('created'));
                ref.current?.refresh();
                setLoading(false);
                return true;
              } catch (e) {
                setLoading(false);
                return false;
              }
            }}
          />
        ),
      }}
      columns={[
        {
          id: 'enabled',
          header: t('enabled'),
          cell: ({ row }) => (
            <Switch
              checked={row.original.enabled}
              onCheckedChange={async (v) => {
                await toggleNodeStatus({ id: row.original.id, enable: v });
                toast.success(v ? t('enabled_on') : t('enabled_off'));
                ref.current?.refresh();
              }}
            />
          ),
        },
        { accessorKey: 'name', header: t('name') },

        {
          id: 'address_port',
          header: `${t('address')}:${t('port')}`,
          cell: ({ row }) => (row.original.address || '—') + ':' + (row.original.port ?? '—'),
        },

        {
          id: 'server_combined',
          header: t('server'),
          cell: ({ row }) => (
            <div className='flex flex-wrap gap-2'>
              <Badge variant='outline'>
                {getServerName(row.original.server_id)} ·{' '}
                {getServerOriginAddr(row.original.server_id)}
              </Badge>
              <Badge variant='outline'>
                {row.original.protocol || '—'} ·{' '}
                {getProtocolOriginPort(row.original.server_id, row.original.protocol)}
              </Badge>
            </div>
          ),
        },
        {
          accessorKey: 'tags',
          header: t('tags'),
          cell: ({ row }) => (
            <div className='flex flex-wrap gap-1'>
              {(row.original.tags || []).length === 0
                ? '—'
                : row.original.tags.map((tg) => (
                    <Badge key={tg} variant='outline'>
                      {tg}
                    </Badge>
                  ))}
            </div>
          ),
        },
      ]}
      params={[{ key: 'search' }]}
      request={async (pagination, filter) => {
        const { data } = await filterNodeList({
          page: pagination.page,
          size: pagination.size,
          search: filter?.search || undefined,
        });
        const list = (data?.data?.list || []) as API.Node[];
        const total = Number(data?.data?.total || list.length);
        return { list, total };
      }}
      actions={{
        render: (row) => [
          <NodeForm
            key='edit'
            trigger={t('edit')}
            title={t('drawerEditTitle')}
            loading={loading}
            initialValues={{
              name: row.name,
              server_id: row.server_id,
              protocol: row.protocol as any,
              address: row.address as any,
              port: row.port as any,
              tags: (row.tags as any) || [],
            }}
            onSubmit={async (values) => {
              setLoading(true);
              try {
                const body: API.UpdateNodeRequest = {
                  id: row.id,
                  name: values.name,
                  server_id: Number(values.server_id!),
                  protocol: values.protocol,
                  address: values.address,
                  port: Number(values.port!),
                  tags: values.tags || [],
                  enabled: row.enabled,
                } as any;
                await updateNode(body);
                toast.success(t('updated'));
                ref.current?.refresh();
                setLoading(false);
                return true;
              } catch (e) {
                setLoading(false);
                return false;
              }
            }}
          />,
          <ConfirmButton
            key='delete'
            trigger={<Button variant='destructive'>{t('delete')}</Button>}
            title={t('confirmDeleteTitle')}
            description={t('confirmDeleteDesc')}
            onConfirm={async () => {
              await deleteNode({ id: row.id } as any);
              toast.success(t('deleted'));
              ref.current?.refresh();
            }}
            cancelText={t('cancel')}
            confirmText={t('confirm')}
          />,
          <Button
            key='copy'
            variant='outline'
            onClick={async () => {
              const { id, enabled, created_at, updated_at, ...rest } = row as any;
              await createNode({
                name: rest.name,
                server_id: rest.server_id,
                protocol: rest.protocol,
                address: rest.address,
                port: rest.port,
                tags: rest.tags || [],
                enabled: false,
              } as any);
              toast.success(t('copied'));
              ref.current?.refresh();
            }}
          >
            {t('copy')}
          </Button>,
        ],
        batchRender(rows) {
          return [
            <ConfirmButton
              key='delete'
              trigger={<Button variant='destructive'>{t('delete')}</Button>}
              title={t('confirmDeleteTitle')}
              description={t('confirmDeleteDesc')}
              onConfirm={async () => {
                await Promise.all(rows.map((r) => deleteNode({ id: r.id } as any)));
                toast.success(t('deleted'));
                ref.current?.refresh();
              }}
              cancelText={t('cancel')}
              confirmText={t('confirm')}
            />,
          ];
        },
      }}
    />
  );
}
