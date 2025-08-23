'use client';

import { ProTable, ProTableActions } from '@/components/pro-table';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Switch } from '@workspace/ui/components/switch';
import { ConfirmButton } from '@workspace/ui/custom-components/confirm-button';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import NodeForm, { type NodeFormValues } from './node-form';

type NodeItem = NodeFormValues & { id: number; enabled: boolean; sort: number };

let mock: NodeItem[] = [
  {
    id: 1,
    enabled: false,
    name: 'Node A',
    server_id: 101,
    protocol: 'shadowsocks',
    server_addr: 'jp-1.example.com',
    port: 443,
    tags: ['hk', 'premium'],
    sort: 1,
  },
  {
    id: 2,
    enabled: true,
    name: 'Node B',
    server_id: 102,
    protocol: 'vless',
    server_addr: 'hk-edge.example.com',
    port: 8443,
    tags: ['jp'],
    sort: 2,
  },
];

const list = async () => ({ list: mock, total: mock.length });
const create = async (v: NodeFormValues) => {
  mock.push({
    id: Date.now(),
    enabled: false,
    sort: 0,
    ...v,
  });
  return true;
};
const update = async (id: number, v: NodeFormValues) => {
  mock = mock.map((x) => (x.id === id ? { ...x, ...v } : x));
  return true;
};
const remove = async (id: number) => {
  mock = mock.filter((x) => x.id !== id);
  return true;
};
const setState = async (id: number, en: boolean) => {
  mock = mock.map((x) => (x.id === id ? { ...x, enabled: en } : x));
  return true;
};

type ProtocolName = 'shadowsocks' | 'vmess' | 'vless' | 'trojan' | 'hysteria2' | 'tuic' | 'anytls';
type ServerProtocolItem = { protocol: ProtocolName; enabled: boolean; config?: { port?: number } };
type ServerRow = { id: number; name: string; server_addr: string; protocols: ServerProtocolItem[] };

async function getServerListMock(): Promise<{ data: { list: ServerRow[] } }> {
  return {
    data: {
      list: [
        {
          id: 101,
          name: 'Tokyo-1',
          server_addr: 'jp-1.example.com',
          protocols: [
            { protocol: 'shadowsocks', enabled: true, config: { port: 443 } },
            { protocol: 'vless', enabled: true, config: { port: 8443 } },
          ],
        },
        {
          id: 102,
          name: 'HK-Edge',
          server_addr: 'hk-edge.example.com',
          protocols: [
            { protocol: 'vmess', enabled: true, config: { port: 443 } },
            { protocol: 'vless', enabled: true, config: { port: 443 } },
          ],
        },
      ],
    },
  };
}

export default function NodesPage() {
  const t = useTranslations('nodes');
  const ref = useRef<ProTableActions>(null);
  const [loading, setLoading] = useState(false);

  const { data: serversResp } = useQuery({
    queryKey: ['getServerListMock'],
    queryFn: getServerListMock,
  });
  const servers: ServerRow[] = serversResp?.data?.list ?? [];
  const serverMap = useMemo(() => {
    const m = new Map<number, ServerRow>();
    servers.forEach((s) => m.set(s.id, s));
    return m;
  }, [servers]);

  const getServerName = (id?: number) => (id ? (serverMap.get(id)?.name ?? `#${id}`) : '—');
  const getServerOriginAddr = (id?: number) => (id ? (serverMap.get(id)?.server_addr ?? '—') : '—');
  const getProtocolOriginPort = (id?: number, proto?: string) => {
    if (!id || !proto) return '—';
    const hit = serverMap.get(id)?.protocols?.find((p) => p.protocol === proto);
    const p = hit?.config?.port;
    return typeof p === 'number' ? String(p) : '—';
  };

  return (
    <ProTable<NodeItem, { search: string }>
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
              await create(values);
              toast.success(t('created'));
              ref.current?.refresh();
              setLoading(false);
              return true;
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
                await setState(row.original.id, v);
                toast.success(v ? t('enabled_on') : t('enabled_off'));
                ref.current?.refresh();
              }}
            />
          ),
        },
        { accessorKey: 'name', header: t('name') },

        {
          id: 'server_addr_port',
          header: t('server_addr_port'),
          cell: ({ row }) => (
            <Badge variant='outline'>
              {(row.original.server_addr || '—') + ':' + (row.original.port ?? '—')}
            </Badge>
          ),
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
              <Badge>
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
      request={async (_pagination, filter) => {
        const { list: items } = await list();
        const kw = (filter?.search || '').toLowerCase().trim();
        const filtered = kw
          ? items.filter((i) =>
              [
                i.name,
                getServerName(i.server_id),
                getServerOriginAddr(i.server_id),
                `${i.server_addr}:${i.port ?? ''}`,
                `${i.protocol}:${getProtocolOriginPort(i.server_id, i.protocol)}`,
                ...(i.tags || []),
              ]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(kw)),
            )
          : items;
        return { list: filtered, total: filtered.length };
      }}
      actions={{
        render: (row) => [
          <NodeForm
            key='edit'
            trigger={t('edit')}
            title={t('drawerEditTitle')}
            loading={loading}
            initialValues={row}
            onSubmit={async (values) => {
              setLoading(true);
              await update(row.id, values);
              toast.success(t('updated'));
              ref.current?.refresh();
              setLoading(false);
              return true;
            }}
          />,
          <ConfirmButton
            key='delete'
            trigger={<Button variant='destructive'>{t('delete')}</Button>}
            title={t('confirmDeleteTitle')}
            description={t('confirmDeleteDesc')}
            onConfirm={async () => {
              await remove(row.id);
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
              const { id, enabled, ...rest } = row;
              await create(rest);
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
                toast.success(t('deleted'));
                ref.current?.refresh();
              }}
              cancelText={t('cancel')}
              confirmText={t('confirm')}
            />,
          ];
        },
      }}
      onSort={async (source, target, items) => {
        const sourceIndex = items.findIndex((item) => String(item.id) === source);
        const targetIndex = items.findIndex((item) => String(item.id) === target);

        const originalSorts = items.map((item) => item.sort);

        const [movedItem] = items.splice(sourceIndex, 1);
        items.splice(targetIndex, 0, movedItem!);

        const updatedItems = items.map((item, index) => {
          const originalSort = originalSorts[index];
          const newSort = originalSort !== undefined ? originalSort : item.sort;
          return { ...item, sort: newSort };
        });

        const changedItems = updatedItems.filter((item, index) => {
          return item.sort !== items[index]?.sort;
        });

        if (changedItems.length > 0) {
          // nodeSort({
          //   sort: changedItems.map((item) => ({ id: item.id, sort: item.sort })),
          // });
        }

        return updatedItems;
      }}
    />
  );
}
