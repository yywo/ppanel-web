import { PinContainer } from '@shadcn/ui/3d-pin';
import { Label } from '@shadcn/ui/label';
import { Separator } from '@shadcn/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shadcn/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shadcn/ui/tooltip';
import { getTranslations } from 'next-intl/server';
import Image from 'next/legacy/image';
import Link from 'next/link';
import AlipayF2F from './alipayf2f';
import Epay from './epay';
import StripeAlipay from './stripe-alipay';
import StripeWeChatPay from './stripe-wechat-pay';

export default async function Page() {
  const response = await (await fetch('https://pay.ppanel.dev/')).json();
  const t = await getTranslations('payment');
  return (
    <>
      <Tabs defaultValue='Epay'>
        <TabsList className='h-full flex-wrap'>
          <TabsTrigger value='Epay'>Epay</TabsTrigger>
          <TabsTrigger value='Stripe-Alipay'>Stripe(AliPay)</TabsTrigger>
          <TabsTrigger value='Strip-WeChatPay'>Stripe(WeChatPay)</TabsTrigger>
          <TabsTrigger value='AlipayF2F'>AlipayF2F</TabsTrigger>
        </TabsList>
        <TabsContent value='Epay'>
          <Epay />
        </TabsContent>
        <TabsContent value='Stripe-Alipay'>
          <StripeAlipay />
        </TabsContent>
        <TabsContent value='Strip-WeChatPay'>
          <StripeWeChatPay />
        </TabsContent>
        <TabsContent value='AlipayF2F'>
          <AlipayF2F />
        </TabsContent>
      </Tabs>
      {response?.list?.length > 0 && (
        <TooltipProvider>
          <Separator />
          <div className='ml-2 mt-4 flex flex-wrap items-center gap-4'>
            <Label className='w-full'>{t('payForRecommendations')}</Label>
            {response.list?.map((item) => {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <Link href={item.href} className='flex flex-col flex-wrap items-center gap-2'>
                      <Image src={item.logo} width={40} height={40} className='rounded-full' />
                      {item.name}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent className='bg-transparent pb-10'>
                    <PinContainer title={item.name} href={item.href}>
                      <div className='flex h-[20rem] w-[20rem] basis-full flex-col p-4 tracking-tight sm:basis-1/2'>
                        <h3 className='text-foreground max-w-xs pb-2 text-base font-bold'>
                          {item.name}
                        </h3>
                        <div className='mb-4 !p-0 text-base font-normal'>
                          <span className='text-muted-foreground'>{item.description}</span>
                        </div>
                        <div className='mt-4 flex w-full flex-1 rounded-lg'>
                          <Image
                            src={item.image}
                            width={288}
                            height={200}
                            className='h-auto w-full'
                          />
                        </div>
                      </div>
                    </PinContainer>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      )}
    </>
  );
}
