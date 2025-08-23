'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@workspace/ui/components/sheet';
import { Switch } from '@workspace/ui/components/switch';
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { EnhancedInput } from '@workspace/ui/custom-components/enhanced-input';
import { Icon } from '@workspace/ui/custom-components/icon';
import { cn } from '@workspace/ui/lib/utils';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { formScheme, getProtocolDefaultConfig, protocols as PROTOCOLS } from './form-scheme';

interface ServerFormProps<T> {
  onSubmit: (data: T) => Promise<boolean> | boolean;
  initialValues?: T | any;
  loading?: boolean;
  trigger: string;
  title: string;
}

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function normalizeValues(raw: any) {
  const map = new Map<string, any>();
  const given = Array.isArray(raw?.protocols) ? raw.protocols : [];
  for (const it of given) map.set(it?.protocol, it);

  const normalized = {
    name: raw?.name ?? '',
    server_addr: raw?.server_addr ?? '',
    country: raw?.country ?? '',
    city: raw?.city ?? '',
    protocols: PROTOCOLS.map((p) => {
      const incoming = map.get(p);
      const def = getProtocolDefaultConfig(p as any);
      if (incoming) {
        return {
          protocol: p,
          enabled: !!incoming.enabled,
          config: { ...def, ...(incoming.config ?? {}) },
        };
      }
      return { protocol: p, enabled: false, config: def };
    }),
  };
  return normalized;
}

export default function ServerForm<T extends { [x: string]: any }>({
  onSubmit,
  initialValues,
  loading,
  trigger,
  title,
}: Readonly<ServerFormProps<T>>) {
  const t = useTranslations('servers');
  const [open, setOpen] = useState(false);

  const defaultValues = useMemo(
    () =>
      normalizeValues({
        name: '',
        server_addr: '',
        country: '',
        city: '',
        protocols: [],
      }),
    [],
  );

  const form = useForm<any>({
    resolver: zodResolver(formScheme),
    defaultValues,
  });
  const { control } = form;
  useFieldArray({ control, name: 'protocols' });

  const [activeProto, setActiveProto] = useState(PROTOCOLS[0]);
  const activeIndex = useMemo(() => PROTOCOLS.findIndex((p) => p === activeProto), [activeProto]);

  useEffect(() => {
    if (initialValues) {
      const normalized = normalizeValues(initialValues);
      form.reset(normalized);
      const enabledFirst = normalized.protocols.find((p: any) => p.enabled)?.protocol;
      setActiveProto((enabledFirst as any) || PROTOCOLS[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  async function handleSubmit(data: { [x: string]: any }) {
    const ok = await onSubmit(data as unknown as T);
    if (ok) setOpen(false);
  }

  function ProtocolEditor({ idx, proto }: { idx: number; proto: string }) {
    const transport = useWatch({ control, name: `protocols.${idx}.config.transport` as const });
    const security = useWatch({ control, name: `protocols.${idx}.config.security` as const });
    const method = useWatch({ control, name: `protocols.${idx}.config.method` as const });
    const enabled = useWatch({ control, name: `protocols.${idx}.enabled` as const });

    return (
      <div className='grid gap-4 p-3'>
        <FormField
          control={control}
          name={`protocols.${idx}.enabled` as const}
          render={({ field }) => (
            <div className='flex items-center justify-between gap-2'>
              <FormLabel className='m-0'>{t('enabled')}</FormLabel>
              <Switch
                checked={!!field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  if (checked) {
                    form.setValue(
                      `protocols.${idx}.config` as const,
                      getProtocolDefaultConfig(proto as any),
                    );
                    if (['trojan', 'hysteria2'].includes(proto)) {
                      form.setValue(`protocols.${idx}.config.security` as const, 'tls');
                    }
                  }
                }}
              />
            </div>
          )}
        />

        {enabled && (
          <>
            {['shadowsocks'].includes(proto) && (
              <div className='grid grid-cols-2 gap-2'>
                <FormField
                  control={control}
                  name={`protocols.${idx}.config.method` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('encryption_method')}</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value) => field.onChange(value)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('select_encryption_method')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='aes-128-gcm'>aes-128-gcm</SelectItem>
                            <SelectItem value='aes-192-gcm'>aes-192-gcm</SelectItem>
                            <SelectItem value='aes-256-gcm'>aes-256-gcm</SelectItem>
                            <SelectItem value='chacha20-ietf-poly1305'>
                              chacha20-ietf-poly1305
                            </SelectItem>
                            <SelectItem value='2022-blake3-aes-128-gcm'>
                              2022-blake3-aes-128-gcm
                            </SelectItem>
                            <SelectItem value='2022-blake3-aes-256-gcm'>
                              2022-blake3-aes-256-gcm
                            </SelectItem>
                            <SelectItem value='2022-blake3-chacha20-poly1305'>
                              2022-blake3-chacha20-poly1305
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`protocols.${idx}.config.port` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('port')}</FormLabel>
                      <FormControl>
                        <EnhancedInput
                          {...field}
                          type='number'
                          step={1}
                          min={1}
                          max={65535}
                          placeholder={t('port_placeholder')}
                          onValueChange={(v) => field.onChange(v)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {[
                  '2022-blake3-aes-128-gcm',
                  '2022-blake3-aes-256-gcm',
                  '2022-blake3-chacha20-poly1305',
                ].includes(method as any) && (
                  <FormField
                    control={control}
                    name={`protocols.${idx}.config.server_key` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('server_key')}</FormLabel>
                        <FormControl>
                          <EnhancedInput {...field} onValueChange={(v) => field.onChange(v)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {['vmess', 'vless', 'trojan', 'hysteria2', 'tuic', 'anytls'].includes(proto) && (
              <div
                className={cn('flex gap-4 *:flex-1', {
                  'grid grid-cols-2': ['hysteria2', 'tuic'].includes(proto),
                })}
              >
                <FormField
                  control={control}
                  name={`protocols.${idx}.config.port` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('port')}</FormLabel>
                      <FormControl>
                        <EnhancedInput
                          {...field}
                          type='number'
                          step={1}
                          min={1}
                          max={65535}
                          placeholder={t('port_placeholder')}
                          onValueChange={(v) => field.onChange(v)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {proto === 'vless' && (
                  <FormField
                    control={control}
                    name={`protocols.${idx}.config.flow` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('flow')}</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('please_select')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value='none'>NONE</SelectItem>
                              <SelectItem value='xtls-rprx-vision'>XTLS-RPRX-Vision</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {proto === 'hysteria2' && (
                  <>
                    <FormField
                      control={control}
                      name={`protocols.${idx}.config.obfs_password` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('obfs_password')}</FormLabel>
                          <FormControl>
                            <EnhancedInput
                              {...field}
                              placeholder={t('obfs_password_placeholder')}
                              onValueChange={(v) => field.onChange(v)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`protocols.${idx}.config.hop_ports` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('hop_ports')}</FormLabel>
                          <FormControl>
                            <EnhancedInput
                              {...field}
                              placeholder={t('hop_ports_placeholder')}
                              onValueChange={(v) => field.onChange(v)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`protocols.${idx}.config.hop_interval` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('hop_interval')}</FormLabel>
                          <FormControl>
                            <EnhancedInput
                              {...field}
                              type='number'
                              onValueChange={(v) => field.onChange(v)}
                              suffix={t('unitSecondsShort')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {proto === 'tuic' && (
                  <>
                    <FormField
                      control={control}
                      name={`protocols.${idx}.config.udp_relay_mode` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('udp_relay_mode')}</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('please_select')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value='native'>Native</SelectItem>
                                <SelectItem value='quic'>QUIC</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`protocols.${idx}.config.congestion_controller` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('congestion_controller')}</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('please_select')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value='bbr'>BBR</SelectItem>
                                <SelectItem value='cubic'>Cubic</SelectItem>
                                <SelectItem value='reno'>Reno</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className='flex gap-2'>
                      <FormField
                        control={control}
                        name={`protocols.${idx}.config.disable_sni` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('disable_sni')}</FormLabel>
                            <FormControl>
                              <div className='pt-2'>
                                <Switch
                                  checked={!!field.value}
                                  onCheckedChange={(checked) => field.onChange(checked)}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`protocols.${idx}.config.reduce_rtt` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('reduce_rtt')}</FormLabel>
                            <FormControl>
                              <div className='pt-2'>
                                <Switch
                                  checked={!!field.value}
                                  onCheckedChange={(checked) => field.onChange(checked)}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {['vmess', 'vless', 'trojan'].includes(proto) && (
              <Card>
                <CardHeader className='flex flex-row items-center justify-between p-3'>
                  <CardTitle>{t('transport_title')}</CardTitle>
                  <FormField
                    control={control}
                    name={`protocols.${idx}.config.transport` as const}
                    render={({ field }) => (
                      <FormItem className='!mt-0 min-w-32'>
                        <FormControl>
                          <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('please_select')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value='tcp'>TCP</SelectItem>
                              <SelectItem value='websocket'>WebSocket</SelectItem>
                              {proto === 'vless' && <SelectItem value='http2'>HTTP/2</SelectItem>}
                              <SelectItem value='grpc'>gRPC</SelectItem>
                              {['vmess', 'vless'].includes(proto) && (
                                <SelectItem value='httpupgrade'>HTTP Upgrade</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardHeader>
                {transport !== 'tcp' && (
                  <CardContent className='flex gap-4 p-3'>
                    {['websocket', 'http2', 'httpupgrade'].includes(transport as any) && (
                      <>
                        <FormField
                          control={control}
                          name={`protocols.${idx}.config.transport_config.path` as const}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('path')}</FormLabel>
                              <FormControl>
                                <EnhancedInput
                                  {...field}
                                  onValueChange={(v) => field.onChange(v)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={`protocols.${idx}.config.transport_config.host` as const}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('host')}</FormLabel>
                              <FormControl>
                                <EnhancedInput
                                  {...field}
                                  onValueChange={(v) => field.onChange(v)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                    {transport === 'grpc' && (
                      <FormField
                        control={control}
                        name={`protocols.${idx}.config.transport_config.service_name` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('service_name')}</FormLabel>
                            <FormControl>
                              <EnhancedInput {...field} onValueChange={(v) => field.onChange(v)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                )}
              </Card>
            )}

            {['vmess', 'vless', 'trojan', 'anytls', 'tuic', 'hysteria2'].includes(proto) && (
              <Card>
                <CardHeader className='flex flex-row items-center justify-between p-3'>
                  <CardTitle>{t('security_title')}</CardTitle>
                  {['vmess', 'vless', 'trojan'].includes(proto) && (
                    <FormField
                      control={control}
                      name={`protocols.${idx}.config.security` as const}
                      render={({ field }) => (
                        <FormItem className='!mt-0 min-w-32'>
                          <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('please_select')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {['vmess', 'vless'].includes(proto) && (
                                <SelectItem value='none'>NONE</SelectItem>
                              )}
                              <SelectItem value='tls'>TLS</SelectItem>
                              {proto === 'vless' && (
                                <SelectItem value='reality'>Reality</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardHeader>

                {(['anytls', 'tuic', 'hysteria2'].includes(proto) ||
                  (['vmess', 'vless', 'trojan'].includes(proto) && security !== 'none')) && (
                  <CardContent className='grid grid-cols-2 gap-4 p-3'>
                    <FormField
                      control={control}
                      name={`protocols.${idx}.config.security_config.sni` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('security_sni')}</FormLabel>
                          <FormControl>
                            <EnhancedInput {...field} onValueChange={(v) => field.onChange(v)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {proto === 'vless' && security === 'reality' && (
                      <>
                        <FormField
                          control={control}
                          name={
                            `protocols.${idx}.config.security_config.reality_server_addr` as const
                          }
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('security_server_address')}</FormLabel>
                              <FormControl>
                                <EnhancedInput
                                  {...field}
                                  placeholder={t('security_server_address_placeholder')}
                                  onValueChange={(v) => field.onChange(v)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={
                            `protocols.${idx}.config.security_config.reality_server_port` as const
                          }
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('security_server_port')}</FormLabel>
                              <FormControl>
                                <EnhancedInput
                                  {...field}
                                  type='number'
                                  min={1}
                                  max={65535}
                                  placeholder={t('security_server_port_placeholder')}
                                  onValueChange={(v) => field.onChange(v)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={
                            `protocols.${idx}.config.security_config.reality_private_key` as const
                          }
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('security_private_key')}</FormLabel>
                              <FormControl>
                                <EnhancedInput
                                  {...field}
                                  placeholder={t('security_private_key_placeholder')}
                                  onValueChange={(v) => field.onChange(v)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={
                            `protocols.${idx}.config.security_config.reality_public_key` as const
                          }
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('security_public_key')}</FormLabel>
                              <FormControl>
                                <EnhancedInput
                                  {...field}
                                  placeholder={t('security_public_key_placeholder')}
                                  onValueChange={(v) => field.onChange(v)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={`protocols.${idx}.config.security_config.reality_short_id` as const}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('security_short_id')}</FormLabel>
                              <FormControl>
                                <EnhancedInput
                                  {...field}
                                  placeholder={t('security_short_id_placeholder')}
                                  onValueChange={(v) => field.onChange(v)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {proto === 'vless' && (
                      <FormField
                        control={control}
                        name={`protocols.${idx}.config.security_config.fingerprint` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('security_fingerprint')}</FormLabel>
                            <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('please_select')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value='chrome'>Chrome</SelectItem>
                                <SelectItem value='firefox'>Firefox</SelectItem>
                                <SelectItem value='safari'>Safari</SelectItem>
                                <SelectItem value='ios'>iOS</SelectItem>
                                <SelectItem value='android'>Android</SelectItem>
                                <SelectItem value='edge'>Edge</SelectItem>
                                <SelectItem value='360'>360</SelectItem>
                                <SelectItem value='qq'>QQ</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={control}
                      name={`protocols.${idx}.config.security_config.allow_insecure` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('security_allow_insecure')}</FormLabel>
                          <FormControl>
                            <div className='pt-2'>
                              <Switch
                                checked={!!field.value}
                                onCheckedChange={(checked) => field.onChange(checked)}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          onClick={() => {
            if (!initialValues) {
              form.reset(defaultValues);
              setActiveProto(PROTOCOLS[0]);
            }
            setOpen(true);
          }}
        >
          {trigger}
        </Button>
      </SheetTrigger>
      <SheetContent className='w-[580px] max-w-full md:max-w-screen-md'>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <ScrollArea className='-mx-6 h-[calc(100dvh-48px-36px-36px-env(safe-area-inset-top))]'>
          <Form {...form}>
            <form className='grid grid-cols-1 gap-2 px-6 pt-4'>
              <div className='grid grid-cols-2 gap-2'>
                <FormField
                  control={control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('name')}</FormLabel>
                      <FormControl>
                        <EnhancedInput {...field} onValueChange={(v) => field.onChange(v)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name='server_addr'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('server_addr')}</FormLabel>
                      <FormControl>
                        <EnhancedInput {...field} onValueChange={(v) => field.onChange(v)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name='country'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('country')}</FormLabel>
                      <FormControl>
                        <EnhancedInput {...field} onValueChange={(v) => field.onChange(v)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name='city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('city')}</FormLabel>
                      <FormControl>
                        <EnhancedInput {...field} onValueChange={(v) => field.onChange(v)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Tabs
                value={activeProto}
                onValueChange={(v) => setActiveProto(v as any)}
                className='w-full pt-3'
              >
                <TabsList className='h-full w-full flex-wrap md:flex-nowrap'>
                  {PROTOCOLS.map((p) => (
                    <TabsTrigger value={p} key={p} className='relative'>
                      <div className='flex items-center gap-2'>{titleCase(p)}</div>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <ProtocolEditor idx={activeIndex} proto={activeProto as string} />
            </form>
          </Form>
        </ScrollArea>
        <SheetFooter className='flex-row justify-end gap-2 pt-3'>
          <Button variant='outline' disabled={loading} onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
          <Button
            disabled={loading}
            onClick={form.handleSubmit(handleSubmit, () => {
              toast.error(t('validation_failed'));
              return false;
            })}
          >
            {loading && <Icon icon='mdi:loading' className='mr-2 animate-spin' />} {t('confirm')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
