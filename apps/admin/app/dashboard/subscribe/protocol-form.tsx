'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
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
} from '@workspace/ui/components/sheet';
import { Textarea } from '@workspace/ui/components/textarea';
import { Icon } from '@workspace/ui/custom-components/icon';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface Client {
  name: string;
  platforms: string[];
}

const clientFormSchema = z.object({
  template: z.string().optional(),
});

const clientsConfig = [
  {
    name: 'Hiddify',
    platforms: ['Windows', 'macOS', 'Linux', 'iOS', 'Android'],
  },
  {
    name: 'SingBox',
    platforms: ['Windows', 'macOS', 'Linux', 'iOS', 'Android'],
  },
  {
    name: 'Clash',
    platforms: ['Windows', 'macOS', 'Linux', 'Android'],
  },
  {
    name: 'V2rayN',
    platforms: ['Windows', 'macOS', 'Linux'],
  },
  {
    name: 'Stash',
    platforms: ['macOS', 'iOS'],
  },
  {
    name: 'Surge',
    platforms: ['macOS', 'iOS'],
  },
  {
    name: 'V2Box',
    platforms: ['macOS', 'iOS'],
  },
  {
    name: 'Shadowrocket',
    platforms: ['iOS'],
  },
  {
    name: 'Quantumult',
    platforms: ['iOS'],
  },
  {
    name: 'Loon',
    platforms: ['iOS'],
  },
  {
    name: 'Egern',
    platforms: ['iOS'],
  },
  {
    name: 'V2rayNG',
    platforms: ['Android'],
  },
  {
    name: 'Surfboard',
    platforms: ['Android'],
  },
  {
    name: 'Netch',
    platforms: ['Windows'],
  },
];

type ClientFormData = z.infer<typeof clientFormSchema>;

export function ProtocolForm() {
  const t = useTranslations('subscribe');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      template: '',
    },
  });

  const clients: Client[] = clientsConfig;

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    // 请求当前客户端的配置模板
    // 这里可以替换为实际的API调用
    // 模拟获取模板数据
    const mockTemplate = `# ${client.name} 配置模板`;
    form.reset({
      template: mockTemplate,
    });
    setOpen(true);
  };

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true);
    try {
      // TODO: 实现保存逻辑
      console.log('Save client template:', {
        name: selectedClient?.name,
        template: data.template,
      });
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOpen(false);
    } catch (error) {
      console.error('Failed to save client template:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {clients.map((client) => (
          <Card
            key={client.name}
            className='hover:bg-muted/50 cursor-pointer transition-colors'
            onClick={() => handleClientClick(client)}
          >
            <CardContent className='p-4'>
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <div className='relative h-6 w-6 flex-shrink-0'>
                    <Image
                      src={`/images/protocols/${client.name}.webp`}
                      alt={client.name}
                      width={24}
                      height={24}
                      className='object-contain'
                      onError={() => {
                        console.log(`Failed to load image for ${client.name}`);
                      }}
                    />
                  </div>
                  <h3 className='text-base font-semibold'>{client.name}</h3>
                  <Icon icon='mdi:chevron-right' className='ml-auto flex-shrink-0' />
                </div>

                <div className='flex flex-wrap gap-1'>
                  {client.platforms.map((platform) => (
                    <Badge key={platform} variant='secondary' className='text-xs'>
                      {platform}
                    </Badge>
                  ))}
                </div>

                <p className='text-muted-foreground text-sm leading-relaxed'>
                  {t(`protocol.clients.${client.name.toLowerCase().replace(/\s+/g, '')}.features`)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className='w-[600px] max-w-full md:max-w-screen-md'>
          <SheetHeader>
            <SheetTitle>
              {t('protocol.subscribeTemplate')} - {selectedClient?.name}
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className='-mx-6 h-[calc(100dvh-48px-36px-36px-env(safe-area-inset-top))] px-6'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-4 pt-4'
                id='client-template-form'
              >
                <FormField
                  control={form.control}
                  name='template'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('protocol.templateContent')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('protocol.templatePlaceholder')}
                          value={field.value}
                          onChange={field.onChange}
                          rows={20}
                          className='font-mono text-sm'
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
            <Button variant='outline' disabled={loading} onClick={() => setOpen(false)}>
              {t('actions.cancel')}
            </Button>
            <Button disabled={loading} type='submit' form='client-template-form'>
              {loading && <Icon icon='mdi:loading' className='mr-2 animate-spin' />}
              {t('actions.saveTemplate')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
