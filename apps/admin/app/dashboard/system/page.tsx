import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { getTranslations } from 'next-intl/server';

import Currency from './currency';
import Invite from './invite';
import Node from './node';
import Site from './site';
import Telegram from './telegram';
import Tos from './tos';
import Verify from './verify';

export default async function Page() {
  const t = await getTranslations('system');

  return (
    <Tabs defaultValue='site'>
      <TabsList className='h-full flex-wrap'>
        <TabsTrigger value='site'>{t('tabs.site')}</TabsTrigger>
        <TabsTrigger value='currency'>{t('tabs.currency')}</TabsTrigger>
        <TabsTrigger value='verify'>{t('tabs.verify')}</TabsTrigger>
        <TabsTrigger value='node'>{t('tabs.node')}</TabsTrigger>
        <TabsTrigger value='invite'>{t('tabs.invite')}</TabsTrigger>
        <TabsTrigger value='telegram'>{t('tabs.telegram')}</TabsTrigger>
        <TabsTrigger value='tos'>{t('tabs.tos')}</TabsTrigger>
      </TabsList>
      <TabsContent value='site'>
        <Site />
      </TabsContent>
      <TabsContent value='currency'>
        <Currency />
      </TabsContent>
      <TabsContent value='verify'>
        <Verify />
      </TabsContent>
      <TabsContent value='node'>
        <Node />
      </TabsContent>
      <TabsContent value='invite'>
        <Invite />
      </TabsContent>
      <TabsContent value='telegram'>
        <Telegram />
      </TabsContent>
      <TabsContent value='tos'>
        <Tos />
      </TabsContent>
    </Tabs>
  );
}
