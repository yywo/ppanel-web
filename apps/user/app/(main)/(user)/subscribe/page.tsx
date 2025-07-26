'use client';

import { Display } from '@/components/display';
import { querySubscribeGroupList, querySubscribeList } from '@/services/user/subscribe';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardFooter, CardHeader } from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { Icon } from '@workspace/ui/custom-components/icon';
import { cn } from '@workspace/ui/lib/utils';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Empty } from '@/components/empty';
import { SubscribeDetail } from '@/components/subscribe/detail';
import Purchase from '@/components/subscribe/purchase';

export default function Page() {
  const t = useTranslations('subscribe');
  const [subscribe, setSubscribe] = useState<API.Subscribe>();

  const [group, setGroup] = useState<string>('');

  const { data: groups } = useQuery({
    queryKey: ['querySubscribeGroupList'],
    queryFn: async () => {
      const { data } = await querySubscribeGroupList();
      return data.data?.list || [];
    },
  });

  const { data } = useQuery({
    queryKey: ['querySubscribeList'],
    queryFn: async () => {
      const { data } = await querySubscribeList();
      return data.data?.list || [];
    },
  });

  return (
    <>
      <Tabs value={group} onValueChange={setGroup} className='space-y-4'>
        {groups && groups.length > 0 && (
          <>
            <h1 className='text-muted-foreground w-full'>{t('category')}</h1>
            <TabsList>
              <TabsTrigger value=''>{t('all')}</TabsTrigger>
              {groups.map((group) => (
                <TabsTrigger key={group.id} value={String(group.id)}>
                  {group.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <h2 className='text-muted-foreground w-full'>{t('products')}</h2>
          </>
        )}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'>
          {data
            ?.filter((item) => item.show)
            ?.filter((item) => (group ? item.group_id === Number(group) : true))
            ?.map((item) => (
              <Card className='flex flex-col' key={item.id}>
                <CardHeader className='bg-muted/50 text-xl font-medium'>{item.name}</CardHeader>
                <CardContent className='flex flex-grow flex-col gap-3 p-6 *:!text-sm'>
                  {/* <div className='font-semibold'>{t('productDescription')}</div> */}
                  <ul className='flex flex-grow flex-col gap-3'>
                    {(() => {
                      let parsedDescription;
                      try {
                        parsedDescription = JSON.parse(item.description);
                      } catch {
                        parsedDescription = { description: '', features: [] };
                      }

                      const { description, features } = parsedDescription;
                      return (
                        <>
                          {description && <li className='text-muted-foreground'>{description}</li>}
                          {features?.map(
                            (
                              feature: {
                                icon: string;
                                label: string;
                                type: 'default' | 'success' | 'destructive';
                              },
                              index: number,
                            ) => (
                              <li
                                className={cn('flex items-center gap-1', {
                                  'text-muted-foreground line-through':
                                    feature.type === 'destructive',
                                })}
                                key={index}
                              >
                                {feature.icon && (
                                  <Icon
                                    icon={feature.icon}
                                    className={cn('text-primary size-5', {
                                      'text-green-500': feature.type === 'success',
                                      'text-destructive': feature.type === 'destructive',
                                    })}
                                  />
                                )}
                                {feature.label}
                              </li>
                            ),
                          )}
                        </>
                      );
                    })()}
                  </ul>
                  <SubscribeDetail
                    subscribe={{
                      ...item,
                      name: undefined,
                    }}
                  />
                </CardContent>
                <Separator />
                <CardFooter className='relative mt-2 flex flex-col gap-2'>
                  <h2 className='pb-5 text-2xl font-semibold sm:text-3xl'>
                    <Display type='currency' value={item.unit_price} />
                    <span className='text-base font-medium'>/{t(item.unit_time || 'Month')}</span>
                  </h2>
                  <Button
                    className='absolute bottom-0 w-full rounded-b-xl rounded-t-none'
                    onClick={() => {
                      setSubscribe(item);
                    }}
                  >
                    {t('buy')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
        </div>
        {data?.length === 0 && <Empty />}
      </Tabs>
      <Purchase subscribe={subscribe} setSubscribe={setSubscribe} />
    </>
  );
}
