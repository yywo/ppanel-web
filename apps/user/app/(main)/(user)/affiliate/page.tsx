'use client';
import { Display } from '@/components/display';
import { Empty } from '@/components/empty';
import { ProList } from '@/components/pro-list';
import useGlobalStore from '@/config/use-global';
import { queryUserAffiliate } from '@/services/user/user';
import { formatDate } from '@repo/ui/utils';
import { Button } from '@shadcn/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shadcn/ui/card';
import { toast } from '@shadcn/ui/lib/sonner';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function Page() {
  const t = useTranslations('affiliate');
  const { user } = useGlobalStore();
  const [sum, setSum] = useState<number>();

  return (
    <div className='flex flex-col gap-4'>
      <Card>
        <CardHeader>
          <CardTitle>{t('totalCommission')}</CardTitle>
          <CardDescription>{t('commissionInfo')}</CardDescription>
        </CardHeader>
        <CardContent className='text-2xl font-bold'>
          <Display type='currency' value={sum} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0'>
          <CardTitle>{t('inviteCode')}</CardTitle>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(`${location.origin}/auth?invite=${user?.refer_code}`);
              toast.success(t('copySuccess'));
            }}
          >
            {t('copyInviteLink')}
          </Button>
        </CardHeader>
        <CardContent className='text-2xl font-bold'>{user?.refer_code}</CardContent>
      </Card>
      <ProList<API.UserAffiliate, Record<string, unknown>>
        request={async (pagination, filter) => {
          const response = await queryUserAffiliate({ ...pagination, ...filter });
          setSum(response.data.data?.sum);
          return {
            list: response.data.data?.list || [],
            total: response.data.data?.total || 0,
          };
        }}
        header={{
          title: t('inviteRecords'),
        }}
        renderItem={(item) => {
          return (
            <Card className='overflow-hidden'>
              <CardContent className='p-3 text-sm'>
                <ul className='grid grid-cols-2 gap-3 *:flex *:flex-col'>
                  <li className='font-semibold'>
                    <span className='text-muted-foreground'>{t('userEmail')}</span>
                    <span>{item.email}</span>
                  </li>
                  <li className='font-semibold'>
                    <span className='text-muted-foreground'>{t('registrationTime')}</span>
                    <time>{formatDate(item.registered_at)}</time>
                  </li>
                </ul>
              </CardContent>
            </Card>
          );
        }}
        empty={<Empty />}
      />
    </div>
  );
}
