'use client';

import { filterServerList } from '@/services/admin/server';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import {
  Form,
  FormControl,
  FormDescription,
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

type ServerRow = API.Server;

export type NodeFormValues = {
  name: string;
  server_id?: number;
  protocol: ProtocolName | '';
  address: string;
  port: number;
  tags: string[];
};

async function getServers(): Promise<ServerRow[]> {
  const { data } = await filterServerList({ page: 1, size: 1000 });
  return (data?.data?.list || []) as ServerRow[];
}

const buildSchema = (t: ReturnType<typeof useTranslations>) =>
  z.object({
    name: z.string().trim().min(1, t('errors.nameRequired')),
    server_id: z.coerce
      .number({ invalid_type_error: t('errors.serverRequired') })
      .int()
      .gt(0, t('errors.serverRequired')),
    protocol: z.custom<ProtocolName>((v) => typeof v === 'string' && v.length > 0, {
      message: t('errors.protocolRequired'),
    }),
    address: z.string().trim().min(1, t('errors.serverAddrRequired')),
    port: z.coerce
      .number({ invalid_type_error: t('errors.portRange') })
      .int()
      .min(1, t('errors.portRange'))
      .max(65535, t('errors.portRange')),
    tags: z.array(z.string()).default([]),
  });

export default function NodeForm(props: {
  trigger: string;
  title: string;
  loading?: boolean;
  initialValues?: Partial<NodeFormValues>;
  onSubmit: (values: NodeFormValues) => Promise<boolean> | boolean;
}) {
  const { trigger, title, loading, initialValues, onSubmit } = props;
  const t = useTranslations('nodes');
  const Scheme = useMemo(() => buildSchema(t), [t]);

  const form = useForm<NodeFormValues>({
    resolver: zodResolver(Scheme),
    defaultValues: {
      name: '',
      server_id: undefined,
      protocol: '',
      address: '',
      port: 0,
      tags: [],
      ...initialValues,
    },
  });

  const serverId = form.watch('server_id');

  const { data } = useQuery({ queryKey: ['filterServerListAll'], queryFn: getServers });
  const servers: ServerRow[] = data as ServerRow[];

  const currentServer = useMemo(() => servers?.find((s) => s.id === serverId), [servers, serverId]);

  const availableProtocols = useMemo(() => {
    return (currentServer?.protocols || [])
      .map((p) => ({
        protocol: (p as any).type as ProtocolName,
        port: (p as any).port as number | undefined,
      }))
      .filter((p) => !!p.protocol);
  }, [currentServer]);

  useEffect(() => {
    if (initialValues) {
      form.reset({
        name: '',
        server_id: undefined,
        protocol: '',
        address: '',
        port: 0,
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
    const dirty = form.formState.dirtyFields as Record<string, any>;
    if (!dirty.name) {
      form.setValue('name', (sel?.name as string) || '', { shouldDirty: false });
    }
    if (!dirty.address) {
      form.setValue('address', (sel?.address as string) || '', { shouldDirty: false });
    }
    const allowed = (sel?.protocols || [])
      .map((p) => (p as any).type as ProtocolName)
      .filter(Boolean);
    if (!allowed.includes(form.getValues('protocol') as ProtocolName)) {
      form.setValue('protocol', '' as any);
    }
    // Do not auto-fill port here; handled in handleProtocolChange
  }

  function handleProtocolChange(nextProto?: ProtocolName | null) {
    const p = (nextProto || '') as ProtocolName | '';
    form.setValue('protocol', p);
    if (!p || !currentServer) return;
    const dirty = form.formState.dirtyFields as Record<string, any>;
    if (!dirty.port) {
      const hit = (currentServer.protocols as any[]).find((x) => (x as any).type === p);
      const port = (hit as any)?.port as number | undefined;
      form.setValue('port', typeof port === 'number' && port > 0 ? port : 0, {
        shouldDirty: false,
      });
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
                          label: `${s.name} (${(s.address as any) || ''})`,
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
                          label: `${p.protocol}${p.port ? ` (${p.port})` : ''}`,
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
                name='address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('address')}</FormLabel>
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
                        placeholder='1-65535'
                        onValueChange={(v) => form.setValue(field.name, Number(v))}
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
                    <FormDescription>{t('tags_description')}</FormDescription>
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
