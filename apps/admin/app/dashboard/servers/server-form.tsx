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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { EnhancedInput } from '@workspace/ui/custom-components/enhanced-input';
import { Icon } from '@workspace/ui/custom-components/icon';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import {
  FINGERPRINTS,
  FLOWS,
  formSchema,
  getLabel,
  getProtocolDefaultConfig,
  LABELS,
  protocols as PROTOCOLS,
  SECURITY,
  SS_CIPHERS,
  TRANSPORTS,
  TUIC_CONGESTION,
  TUIC_UDP_RELAY_MODES,
} from './form-schema';

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
  return {
    name: raw?.name ?? '',
    address: raw?.address ?? '',
    country: raw?.country ?? '',
    city: raw?.city ?? '',
    ratio: Number(raw?.ratio ?? 1),
    protocols: Array.isArray(raw?.protocols) ? raw.protocols : [],
  };
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
  const [activeType, setActiveType] = useState<(typeof PROTOCOLS)[number]>('shadowsocks');

  const defaultValues = useMemo(
    () =>
      normalizeValues({
        name: '',
        address: '',
        country: '',
        city: '',
        ratio: 1,
        protocols: [],
      }),
    [],
  );

  const form = useForm<any>({ resolver: zodResolver(formSchema), defaultValues });
  const { control } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'protocols' });

  const protocolsValues = useWatch({ control, name: 'protocols' });

  useEffect(() => {
    const normalized = normalizeValues(initialValues || {});
    const byType = new Map<string, any>();
    (Array.isArray(normalized.protocols) ? normalized.protocols : []).forEach((p: any) => {
      if (p && p.type) byType.set(String(p.type), p);
    });
    const full = PROTOCOLS.map((t) => byType.get(t) || getProtocolDefaultConfig(t));
    form.reset({ ...normalized, protocols: full });
    setActiveType('shadowsocks');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  async function handleSubmit(data: { [x: string]: any }) {
    const all = Array.isArray(data?.protocols) ? data.protocols : [];
    const filtered = all
      .filter((p: any) => {
        const v = (p ?? {}).port;
        const n = Number(v);
        return Number.isFinite(n) && n > 0 && n <= 65535;
      })
      .map((p: any) => ({ ...p, port: Number(p.port) }));
    if (filtered.length === 0) {
      toast.error(t('validation_failed'));
      return;
    }
    const body = {
      name: data?.name,
      country: data?.country,
      city: data?.city,
      ratio: Number(data?.ratio ?? 1),
      address: data?.address,
      protocols: filtered,
    } as unknown as T;
    const ok = await onSubmit(body as unknown as T);
    if (ok) setOpen(false);
  }

  // inlined protocol editor below in TabsContent

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          onClick={() => {
            if (!initialValues) {
              const full = PROTOCOLS.map((t) => getProtocolDefaultConfig(t));
              form.reset({ ...defaultValues, protocols: full });
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
              <div className='grid grid-cols-3 gap-2'>
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
              <div className='grid grid-cols-2 gap-2'>
                <FormField
                  control={control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('address')}</FormLabel>
                      <FormControl>
                        <EnhancedInput
                          {...field}
                          placeholder={t('address_placeholder')}
                          onValueChange={(v) => field.onChange(v)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name='ratio'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('traffic_ratio')}</FormLabel>
                      <FormControl>
                        <EnhancedInput
                          {...field}
                          type='number'
                          step={0.1}
                          min={0}
                          onValueChange={(v) => field.onChange(v)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='pt-2'>
                <Tabs value={activeType} onValueChange={(v) => setActiveType(v as any)}>
                  <TabsList className='w-full flex-wrap'>
                    {PROTOCOLS.map((type) => (
                      <TabsTrigger key={type} value={type}>
                        {titleCase(type)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {PROTOCOLS.map((type) => {
                    const i = Math.max(
                      0,
                      PROTOCOLS.findIndex((t) => t === type),
                    );
                    const current = Array.isArray(protocolsValues) ? protocolsValues[i] || {} : {};
                    const transport = (current?.transport as string | undefined) ?? 'tcp';
                    const security = current?.security as string | undefined;
                    const cipher = current?.cipher as string | undefined;
                    return (
                      <TabsContent key={type} value={type} className='pt-3'>
                        <div className='space-y-4'>
                          <div className='grid grid-cols-2 gap-2'>
                            <FormField
                              control={control}
                              name={`protocols.${i}.port` as const}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('port')}</FormLabel>
                                  <FormControl>
                                    <EnhancedInput
                                      {...field}
                                      type='number'
                                      step={1}
                                      min={0}
                                      max={65535}
                                      placeholder='1-65535'
                                      onValueChange={(v) => field.onChange(v)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {type === 'shadowsocks' && (
                              <>
                                <FormField
                                  control={control}
                                  name={`protocols.${i}.cipher` as const}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{t('encryption_method')}</FormLabel>
                                      <FormControl>
                                        <Select
                                          value={field.value ?? 'chacha20-ietf-poly1305'}
                                          onValueChange={(value) => field.onChange(value)}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue
                                                placeholder={t('select_encryption_method')}
                                              />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {(SS_CIPHERS as readonly string[]).map((c) => (
                                              <SelectItem key={c} value={c}>
                                                {getLabel(c)}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                {[
                                  '2022-blake3-aes-128-gcm',
                                  '2022-blake3-aes-256-gcm',
                                  '2022-blake3-chacha20-poly1305',
                                ].includes((cipher || '').toString()) && (
                                  <FormField
                                    control={control}
                                    name={`protocols.${i}.server_key` as const}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>{t('server_key')}</FormLabel>
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
                                )}
                              </>
                            )}

                            {type === 'vless' && (
                              <FormField
                                control={control}
                                name={`protocols.${i}.flow` as const}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t('flow')}</FormLabel>
                                    <FormControl>
                                      <Select
                                        value={field.value ?? 'none'}
                                        onValueChange={(v) => field.onChange(v)}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder={t('please_select')} />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {(FLOWS.vless as readonly string[]).map((opt) => (
                                            <SelectItem key={opt} value={opt}>
                                              {getLabel(opt)}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}

                            {type === 'hysteria2' && (
                              <>
                                <FormField
                                  control={control}
                                  name={`protocols.${i}.obfs_password` as const}
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
                                  name={`protocols.${i}.hop_ports` as const}
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
                                  name={`protocols.${i}.hop_interval` as const}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{t('hop_interval')}</FormLabel>
                                      <FormControl>
                                        <EnhancedInput
                                          {...field}
                                          type='number'
                                          min={0}
                                          suffix='S'
                                          onValueChange={(v) => field.onChange(v)}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </>
                            )}

                            {type === 'tuic' && (
                              <>
                                <FormField
                                  control={control}
                                  name={`protocols.${i}.udp_relay_mode` as const}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{t('udp_relay_mode')}</FormLabel>
                                      <FormControl>
                                        <Select
                                          value={field.value ?? 'native'}
                                          onValueChange={(v) => field.onChange(v)}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder={t('please_select')} />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {(TUIC_UDP_RELAY_MODES as readonly string[]).map(
                                              (opt) => (
                                                <SelectItem key={opt} value={opt}>
                                                  {getLabel(opt)}
                                                </SelectItem>
                                              ),
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={control}
                                  name={`protocols.${i}.congestion_controller` as const}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{t('congestion_controller')}</FormLabel>
                                      <FormControl>
                                        <Select
                                          value={field.value ?? 'bbr'}
                                          onValueChange={(v) => field.onChange(v)}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder={t('please_select')} />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {(TUIC_CONGESTION as readonly string[]).map((opt) => (
                                              <SelectItem key={opt} value={opt}>
                                                {getLabel(opt)}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className='grid grid-cols-2 gap-4'>
                                  <FormField
                                    control={control}
                                    name={`protocols.${i}.disable_sni` as const}
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
                                    name={`protocols.${i}.reduce_rtt` as const}
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

                          {['vmess', 'vless', 'trojan'].includes(type) && (
                            <Card>
                              <CardHeader className='flex flex-row items-center justify-between p-3'>
                                <CardTitle>{t('transport_title')}</CardTitle>
                                <FormField
                                  control={control}
                                  name={`protocols.${i}.transport` as const}
                                  render={({ field }) => (
                                    <FormItem className='!mt-0 min-w-32'>
                                      <FormControl>
                                        <Select
                                          value={field.value ?? 'tcp'}
                                          onValueChange={(v) => field.onChange(v)}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder={t('please_select')} />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {(
                                              TRANSPORTS[
                                                type as 'vmess' | 'vless' | 'trojan'
                                              ] as readonly string[]
                                            ).map((opt) => (
                                              <SelectItem key={opt} value={opt}>
                                                {getLabel(opt)}
                                              </SelectItem>
                                            ))}
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
                                  {['websocket', 'http2', 'httpupgrade'].includes(
                                    transport as string,
                                  ) && (
                                    <>
                                      <FormField
                                        control={form.control}
                                        name={`protocols.${i}.host` as const}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>HOST</FormLabel>
                                            <FormControl>
                                              <EnhancedInput
                                                {...field}
                                                onValueChange={(value) => {
                                                  form.setValue(field.name, value);
                                                }}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={control}
                                        name={`protocols.${i}.path` as const}
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
                                    </>
                                  )}
                                  {transport === 'grpc' && (
                                    <FormField
                                      control={control}
                                      name={`protocols.${i}.service_name` as const}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>{t('service_name')}</FormLabel>
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
                                  )}
                                </CardContent>
                              )}
                            </Card>
                          )}

                          {['vmess', 'vless', 'trojan', 'anytls', 'tuic', 'hysteria2'].includes(
                            type,
                          ) && (
                            <Card>
                              <CardHeader className='flex flex-row items-center justify-between p-3'>
                                <CardTitle>{t('security_title')}</CardTitle>
                                {['vmess', 'vless', 'trojan'].includes(type) && (
                                  <FormField
                                    control={control}
                                    name={`protocols.${i}.security` as const}
                                    render={({ field }) => (
                                      <FormItem className='!mt-0 min-w-32'>
                                        <Select
                                          value={
                                            field.value ??
                                            (type === 'vless'
                                              ? 'none'
                                              : type === 'trojan'
                                                ? 'tls'
                                                : 'none')
                                          }
                                          onValueChange={(v) => field.onChange(v)}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder={t('please_select')} />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {(
                                              SECURITY[
                                                type as 'vless' | 'vmess' | 'trojan'
                                              ] as readonly string[]
                                            ).map((opt) => (
                                              <SelectItem key={opt} value={opt}>
                                                {LABELS[opt as keyof typeof LABELS] ?? opt}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                )}
                              </CardHeader>

                              {(['anytls', 'tuic', 'hysteria2'].includes(type) ||
                                (['vmess', 'vless', 'trojan'].includes(type) &&
                                  security !== 'none')) && (
                                <CardContent className='grid grid-cols-2 gap-4 p-3'>
                                  <FormField
                                    control={control}
                                    name={`protocols.${i}.sni` as const}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>{t('security_sni')}</FormLabel>
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

                                  {type === 'vless' && security === 'reality' && (
                                    <>
                                      <FormField
                                        control={control}
                                        name={`protocols.${i}.reality_server_addr` as const}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>{t('security_server_address')}</FormLabel>
                                            <FormControl>
                                              <EnhancedInput
                                                {...field}
                                                placeholder={t(
                                                  'security_server_address_placeholder',
                                                )}
                                                onValueChange={(v) => field.onChange(v)}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={control}
                                        name={`protocols.${i}.reality_server_port` as const}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>{t('security_server_port')}</FormLabel>
                                            <FormControl>
                                              <EnhancedInput
                                                {...field}
                                                type='number'
                                                min={1}
                                                max={65535}
                                                placeholder='1-65535'
                                                onValueChange={(v) => field.onChange(v)}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={control}
                                        name={`protocols.${i}.reality_private_key` as const}
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
                                        name={`protocols.${i}.reality_public_key` as const}
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
                                        name={`protocols.${i}.reality_short_id` as const}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>{t('security_short_id')}</FormLabel>
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

                                  <FormField
                                    control={control}
                                    name={`protocols.${i}.fingerprint` as const}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>{t('security_fingerprint')}</FormLabel>
                                        <FormControl>
                                          <Select
                                            value={field.value ?? 'chrome'}
                                            onValueChange={(v) => field.onChange(v)}
                                          >
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue placeholder={t('please_select')} />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              {(FINGERPRINTS as readonly string[]).map((fp) => (
                                                <SelectItem key={fp} value={fp}>
                                                  {getLabel(fp)}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={control}
                                    name={`protocols.${i}.allow_insecure` as const}
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
                        </div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </div>
            </form>
          </Form>
        </ScrollArea>
        <SheetFooter className='flex-row justify-end gap-2 pt-3'>
          <Button variant='outline' disabled={loading} onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
          <Button
            disabled={loading}
            onClick={form.handleSubmit(handleSubmit, (e) => {
              console.log(e, form.getValues());
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
