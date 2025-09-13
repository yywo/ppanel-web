'use client';

import { getVersion, restartSystem } from '@/services/admin/tool';
import { formatDate } from '@/utils/common';
import { useQuery } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@workspace/ui/components/alert-dialog';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Icon } from '@workspace/ui/custom-components/icon';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import packageJson from '../../../../package.json';
import SystemLogsDialog from './system-logs-dialog';

export default function SystemVersionCard() {
  const t = useTranslations('tool');
  const [openRestart, setOpenRestart] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  const { data: latestReleases } = useQuery({
    queryKey: ['getLatestReleases'],
    queryFn: async () => {
      try {
        const [webResponse, serverResponse] = await Promise.all([
          fetch('https://api.github.com/repos/perfect-panel/ppanel-web/releases/latest'),
          fetch('https://api.github.com/repos/perfect-panel/server/releases/latest'),
        ]);

        const webData = webResponse.ok ? await webResponse.json() : null;
        const serverData = serverResponse.ok ? await serverResponse.json() : null;

        return {
          web: webData
            ? {
                version: webData.tag_name,
                url: webData.html_url,
                publishedAt: webData.published_at,
              }
            : null,
          server: serverData
            ? {
                version: serverData.tag_name,
                url: serverData.html_url,
                publishedAt: serverData.published_at,
              }
            : null,
        };
      } catch (error) {
        console.error('Failed to fetch latest releases:', error);
        return { web: null, server: null };
      }
    },
    staleTime: 60 * 60 * 1000,
    retry: 1,
    retryDelay: 10000,
  });

  const hasNewVersion =
    latestReleases?.web && packageJson.version !== latestReleases.web.version.replace(/^v/, '');

  const { data: systemInfo } = useQuery({
    queryKey: ['getVersion'],
    queryFn: async () => {
      const { data } = await getVersion();

      const versionString = (data.data?.version || '').replace(' Develop', '').trim();
      const releaseVersionRegex = /^[Vv]?\d+\.\d+\.\d+(-[a-zA-Z]+(\.\d+)?)?$/;
      const timeMatch = versionString.match(/\(([^)]+)\)/);
      const timeInBrackets = timeMatch ? timeMatch[1] : '';

      const versionWithoutTime = versionString.replace(/\([^)]*\)/, '').trim();

      const isDevelopment =
        versionWithoutTime.includes('-dev') ||
        versionWithoutTime.includes('-debug') ||
        versionWithoutTime.includes('-nightly') ||
        versionWithoutTime.includes('dev') ||
        !releaseVersionRegex.test(versionWithoutTime);

      let baseVersion = versionWithoutTime;
      let lastUpdated = '';

      if (isDevelopment && versionWithoutTime.includes('-')) {
        const parts = versionWithoutTime.split('-');
        baseVersion = parts[0] || versionWithoutTime;
      }

      lastUpdated = formatDate(new Date(timeInBrackets || Date.now())) || '';

      const displayVersion =
        baseVersion.startsWith('V') || baseVersion.startsWith('v')
          ? baseVersion
          : `V${baseVersion}`;

      return {
        isRelease: !isDevelopment,
        version: displayVersion,
        lastUpdated,
      };
    },
  });

  const hasServerNewVersion =
    latestReleases?.server &&
    systemInfo &&
    systemInfo.version.replace(/^V/, '') !== latestReleases.server.version.replace(/^v/, '');

  return (
    <Card className='p-3'>
      <CardHeader className='mb-2 p-0'>
        <CardTitle className='flex items-center justify-between'>
          {t('systemServices')}
          <div className='flex items-center space-x-2'>
            <SystemLogsDialog variant='outline' size='sm' />
            <AlertDialog open={openRestart} onOpenChange={setOpenRestart}>
              <AlertDialogTrigger asChild>
                <Button variant='destructive' size='sm'>
                  {t('systemReboot')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('confirmSystemReboot')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('rebootDescription')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <Button
                    onClick={async () => {
                      setIsRestarting(true);
                      await restartSystem();
                      await new Promise((resolve) => setTimeout(resolve, 5000));
                      setIsRestarting(false);
                      setOpenRestart(false);
                    }}
                    disabled={isRestarting}
                  >
                    {isRestarting && <Icon icon='mdi:loading' className='mr-2 animate-spin' />}
                    {isRestarting ? t('rebooting') : t('confirmReboot')}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3 p-0'>
        <div className='flex flex-1 items-center justify-between'>
          <div className='flex items-center'>
            <Icon icon='mdi:web' className='mr-2 h-4 w-4 text-green-600' />
            <span className='text-sm font-medium'>{t('webVersion')}</span>
          </div>
          <div className='flex items-center space-x-2'>
            <Badge>V{packageJson.version}</Badge>
            {hasNewVersion && (
              <Link
                href={
                  latestReleases?.web?.url || 'https://github.com/perfect-panel/ppanel-web/releases'
                }
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center space-x-1'
              >
                <Badge variant='destructive' className='animate-pulse px-2 py-0.5 text-xs'>
                  {t('newVersionAvailable')}
                </Badge>
                <Icon icon='mdi:open-in-new' className='h-3 w-3' />
              </Link>
            )}
          </div>
        </div>
        <div className='flex flex-1 items-center justify-between'>
          <div className='flex items-center'>
            <Icon icon='mdi:server' className='mr-2 h-4 w-4 text-blue-600' />
            <span className='text-sm font-medium'>{t('serverVersion')}</span>
          </div>
          <div className='flex items-center space-x-2'>
            <Badge variant={!systemInfo?.isRelease ? 'destructive' : 'default'}>
              {systemInfo?.version || 'V1.0.0'}
            </Badge>
            {hasServerNewVersion && (
              <Link
                href={
                  latestReleases?.server?.url || 'https://github.com/perfect-panel/server/releases'
                }
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center space-x-1'
              >
                <Badge variant='destructive' className='animate-pulse px-2 py-0.5 text-xs'>
                  {t('newVersionAvailable')}
                </Badge>
                <Icon icon='mdi:open-in-new' className='h-3 w-3' />
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
