'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Progress } from '@workspace/ui/components/progress';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { formatDate } from '@workspace/ui/utils';
import { useTranslations } from 'next-intl';

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function NodeStatusCell({ status }: { status: API.NodeStatus }) {
  const t = useTranslations('server.node');

  const {
    last_at,
    online_users,
    status: serverStatus,
  } = status || {
    online_users: [],
    status: {
      cpu: 0,
      mem: 0,
      disk: 0,
      updated_at: 0,
    },
    last_at: 0,
  };
  const isOnline = last_at > 0;
  const badgeVariant = isOnline ? 'default' : 'destructive';
  const badgeText = isOnline ? t('normal') : t('abnormal');
  const onlineCount = Array.isArray(online_users) ? online_users?.length : 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='flex items-center gap-2 text-xs *:flex-1'>
            <div className='flex items-center space-x-1'>
              <Badge variant={badgeVariant}>{badgeText}</Badge>
              <span className='font-medium'>
                {t('onlineCount')}: {onlineCount}
              </span>
            </div>
            <div className='flex flex-col space-y-1'>
              <div className='flex justify-between'>
                <span>CPU</span>
                <span>{formatPercentage(serverStatus?.cpu ?? 0)}</span>
              </div>
              <Progress value={(serverStatus?.cpu ?? 0) * 100} className='h-2' max={100} />
            </div>
            <div className='flex flex-col space-y-1'>
              <div className='flex justify-between'>
                <span>{t('memory')}</span>
                <span>{formatPercentage(serverStatus?.mem ?? 0)}</span>
              </div>
              <Progress value={(serverStatus?.mem ?? 0) * 100} className='h-2' max={100} />
            </div>
            <div className='flex flex-col space-y-1'>
              <div className='flex justify-between'>
                <span>{t('disk')}</span>
                <span>{formatPercentage(serverStatus?.disk ?? 0)}</span>
              </div>
              <Progress value={(serverStatus?.disk ?? 0) * 100} className='h-2' max={100} />
            </div>
            {isOnline && (
              <div>
                {t('lastUpdated')}: {formatDate(serverStatus?.updated_at ?? 0)}
              </div>
            )}
          </div>
        </TooltipTrigger>
        {isOnline && onlineCount > 0 && (
          <TooltipContent className='bg-muted text-foreground w-80'>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <h4 className='text-sm font-semibold'>{t('onlineUsers')}</h4>
                <ScrollArea className='h-[400px] rounded-md border p-2'>
                  {online_users.map((user, index) => (
                    <div key={user.uid} className='py-1 text-xs'>
                      {user.ip} (UID: {user.uid})
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
