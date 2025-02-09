import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { getTranslations } from 'next-intl/server';
import Currency from './currency';
import Site from './site';
import Tos from './tos';

export default async function Page() {
  const t = await getTranslations('system');

  return (
    <Tabs defaultValue='site'>
      <TabsList className='h-full flex-wrap'>
        <TabsTrigger value='site'>{t('tabs.site')}</TabsTrigger>
        <TabsTrigger value='currency'>{t('tabs.currency')}</TabsTrigger>
        <TabsTrigger value='tos'>{t('tabs.tos')}</TabsTrigger>
      </TabsList>
      <TabsContent value='site'>
        <Site />
      </TabsContent>
      <TabsContent value='currency'>
        <Currency />
      </TabsContent>
      <TabsContent value='tos'>
        <Tos />
      </TabsContent>
    </Tabs>
  );
}
