'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@workspace/ui/components/sheet';
import { Combobox } from '@workspace/ui/custom-components/combobox';
import { EnhancedInput } from '@workspace/ui/custom-components/enhanced-input';
import TagInput from '@workspace/ui/custom-components/tag-input';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export type ProtocolName =
  | 'shadowsocks'
  | 'vmess'
  | 'vless'
  | 'trojan'
  | 'hysteria2'
  | 'tuic'
  | 'anytls';

type ServerProtocolItem = {
  protocol: ProtocolName;
  enabled: boolean;
  config?: { port?: number } & Record<string, unknown>;
};

type ServerRow = {
  id: number;
  name: string;
  server_addr: string;
  protocols: ServerProtocolItem[];
};

export type NodeFormValues = {
  name: string;
  server_id?: number;
  protocol: ProtocolName | '';
  server_addr: string;
  port?: number;
  tags: string[];
};

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
            { protocol: 'trojan', enabled: false, config: { port: 443 } },
          ],
        },
        {
          id: 102,
          name: 'HK-Edge',
          server_addr: 'hk-edge.example.com',
          protocols: [
            { protocol: 'vmess', enabled: true, config: { port: 443 } },
            { protocol: 'vless', enabled: true, config: { port: 443 } },
            { protocol: 'hysteria2', enabled: true, config: { port: 60000 } },
          ],
        },
        {
          id: 103,
          name: 'AnyTLS Lab',
          server_addr: 'lab.example.com',
          protocols: [
            { protocol: 'anytls', enabled: true, config: { port: 443 } },
            { protocol: 'tuic', enabled: false, config: { port: 4443 } },
          ],
        },
      ],
    },
  };
}

const buildSchema = (t: ReturnType<typeof useTranslations>) =>
  z
    .object({
      name: z.string().min(1, t('errors.nameRequired')),
      server_id: z.number({ invalid_type_error: t('errors.serverRequired') }).optional(),
      protocol: z.string().min(1, t('errors.protocolRequired')),
      server_addr: z.string().min(1, t('errors.serverAddrRequired')),
      port: z
        .number()
        .int()
        .min(1, t('errors.portRange'))
        .max(65535, t('errors.portRange'))
        .optional(),
      tags: z.array(z.string()),
    })
    .refine((v) => !!v.server_id, { path: ['server_id'], message: t('errors.serverRequired') });

export default function NodeForm(props: {
  trigger: string;
  title: string;
  loading?: boolean;
  initialValues?: Partial<NodeFormValues>;
  onSubmit: (values: NodeFormValues) => Promise<boolean> | boolean;
}) {
  const { trigger, title, loading, initialValues, onSubmit } = props;
  const t = useTranslations('nodes');
  const schema = useMemo(() => buildSchema(t), [t]);

  const form = useForm<NodeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      server_id: undefined,
      protocol: '',
      server_addr: '',
      port: undefined,
      tags: [],
      ...initialValues,
    },
  });

  const serverId = form.watch('server_id');

  const { data } = useQuery({ queryKey: ['getServerListMock'], queryFn: getServerListMock });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const servers: ServerRow[] = data?.data?.list ?? [];

  const currentServer = useMemo(() => servers.find((s) => s.id === serverId), [servers, serverId]);

  const availableProtocols = useMemo(
    () =>
      (currentServer?.protocols || [])
        .filter((p) => p.enabled)
        .map((p) => ({
          protocol: p.protocol,
          port: p.config?.port,
        })),
    [currentServer],
  );

  useEffect(() => {
    if (initialValues) {
      form.reset({
        name: '',
        server_id: undefined,
        protocol: '',
        server_addr: '',
        port: undefined,
        tags: [],
        ...initialValues,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  function handleServerChange(nextId?: number | null) {
    const id = nextId ?? undefined;
    form.setValue('server_id', id);

    const sel = servers.find((s) => s.id === id);
    if (!form.getValues('server_addr') && sel?.server_addr) {
      form.setValue('server_addr', sel.server_addr);
    }
    const allowed = (sel?.protocols || []).filter((p) => p.enabled).map((p) => p.protocol);
    if (!allowed.includes(form.getValues('protocol') as ProtocolName)) {
      form.setValue('protocol', '' as any);
    }
  }

  function handleProtocolChange(nextProto?: ProtocolName | null) {
    const p = (nextProto || '') as ProtocolName | '';
    form.setValue('protocol', p);
    if (!p || !currentServer) return;
    const curPort = Number(form.getValues('port') || 0);
    if (!curPort) {
      const hit = currentServer.protocols.find((x) => x.protocol === p);
      const port = hit?.config?.port;
      if (typeof port === 'number' && port > 0) {
        form.setValue('port', port);
      }
    }
  }

  async function submit(values: NodeFormValues) {
    const ok = await onSubmit(values);
    if (ok) form.reset();
    return ok;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button onClick={() => form.reset()}>{trigger}</Button>
      </SheetTrigger>

      <SheetContent className='w-[560px] max-w-full'>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <ScrollArea className='-mx-6 h-[calc(100dvh-48px-36px-36px-env(safe-area-inset-top))] px-6 pt-4'>
          <Form {...form}>
            <form className='grid grid-cols-1 gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('name')}</FormLabel>
                    <FormControl>
                      <EnhancedInput
                        {...field}
                        onValueChange={(v) => form.setValue(field.name, v as string)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='tags'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('tags')}</FormLabel>
                    <FormControl>
                      <TagInput
                        placeholder={t('tags_placeholder')}
                        value={field.value || []}
                        onChange={(v) => form.setValue(field.name, v)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='server_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('server')}</FormLabel>
                    <FormControl>
                      <Combobox<number, false>
                        placeholder={t('select_server')}
                        value={field.value}
                        options={servers.map((s) => ({
                          value: s.id,
                          label: `${s.name} (${s.server_addr})`,
                        }))}
                        onChange={(v) => handleServerChange(v)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='protocol'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('protocol')}</FormLabel>
                    <FormControl>
                      <Combobox<string, false>
                        placeholder={t('select_protocol')}
                        value={field.value}
                        options={availableProtocols.map((p) => ({
                          value: p.protocol,
                          label: `${p.protocol} (${p.port})`,
                        }))}
                        onChange={(v) => handleProtocolChange((v as ProtocolName) || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='server_addr'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('server_addr')}</FormLabel>
                    <FormControl>
                      <EnhancedInput
                        {...field}
                        onValueChange={(v) => form.setValue(field.name, v as string)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='port'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('port')}</FormLabel>
                    <FormControl>
                      <EnhancedInput
                        {...field}
                        type='number'
                        min={1}
                        max={65535}
                        placeholder='1 - 65535'
                        onValueChange={(v) => form.setValue(field.name, Number(v))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>

        <SheetFooter className='flex-row justify-end gap-2 pt-3'>
          <Button variant='outline' disabled={loading}>
            {t('cancel')}
          </Button>
          <Button
            disabled={loading}
            onClick={form.handleSubmit(
              async (vals) => submit(vals),
              (errors) => {
                const key = Object.keys(errors)[0] as keyof typeof errors;
                if (key) toast.error(String(errors[key]?.message));
                return false;
              },
            )}
          >
            {t('confirm')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
