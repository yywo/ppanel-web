import { getTranslations } from 'next-intl/server';

import SubscribeTable from './subscribe-table';

export default async function Page() {
  const t = await getTranslations('product');

  return <SubscribeTable />;
}
