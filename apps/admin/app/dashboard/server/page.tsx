import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shadcn/ui/tabs';
import { getTranslations } from 'next-intl/server';

import GroupTable from './group-table';
import NodeTable from './node-table';

export default async function Page() {
  const t = await getTranslations('server');

  return (
    <Tabs defaultValue='node'>
      <TabsList>
        <TabsTrigger value='node'>{t('tabs.node')}</TabsTrigger>
        <TabsTrigger value='group'>{t('tabs.nodeGroup')}</TabsTrigger>
      </TabsList>
      <TabsContent value='node'>
        <NodeTable />
      </TabsContent>
      <TabsContent value='group'>
        <GroupTable />
      </TabsContent>
    </Tabs>
  );
}
