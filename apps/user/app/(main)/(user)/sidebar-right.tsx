'use client';

import { Display } from '@/components/display';
import useGlobalStore from '@/config/use-global';
import { Icon } from '@iconify/react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Sidebar, SidebarContent } from '@workspace/ui/components/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { isBrowser } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';
import CopyToClipboard from 'react-copy-to-clipboard';
import { toast } from 'sonner';
import Recharge from './order/recharge';

export function SidebarRight({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useGlobalStore();
  const t = useTranslations('layout');

  return (
    <Sidebar collapsible='none' side='right' {...props}>
      <SidebarContent>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 p-3 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('accountBalance')}</CardTitle>
            <Recharge variant='link' className='p-0' />
          </CardHeader>
          <CardContent className='p-3 text-2xl font-bold'>
            <Display type='currency' value={user?.balance} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 p-3 pb-2'>
            <CardTitle className='text-sm font-medium'>{t('inviteCode')}</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CopyToClipboard
                    text={`${isBrowser() && location?.origin}/auth?invite=${user?.refer_code}`}
                    onCopy={(text, result) => {
                      if (result) {
                        toast.success(t('copySuccess'));
                      }
                    }}
                  >
                    <Button variant='ghost' className='size-5 p-0'>
                      <Icon icon='mdi:content-copy' className='text-primary text-2xl' />
                    </Button>
                  </CopyToClipboard>
                </TooltipTrigger>
                <TooltipContent>{t('copyInviteLink')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent className='truncate p-3 font-bold'>{user?.refer_code}</CardContent>
        </Card>
      </SidebarContent>
    </Sidebar>
  );
}
