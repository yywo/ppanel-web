import { Avatar, AvatarFallback, AvatarImage } from '@shadcn/ui/avatar';
import { Card, CardDescription, CardHeader, CardTitle } from '@shadcn/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shadcn/ui/tooltip';
import { getLocale } from 'next-intl/server';
import Image from 'next/legacy/image';
import Link from 'next/link';

const BASE_URL = 'https://cdn.jsdelivr.net/gh/perfect-panel/ppanel-assets/billing/index.json';

interface BillingProps {
  type: 'dashboard' | 'payment';
}
export default async function Billing({ type }: BillingProps) {
  const locale = await getLocale();
  const response = await fetch(BASE_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();

  if (data[type].length === 0) return null;
  return (
    <TooltipProvider>
      <h1 className='text mt-2 font-bold'>
        <span>{locale === 'en-US' ? 'Advertisement' : '广告合作'}</span>
        <span className='text-muted-foreground ml-2 text-xs'>
          {locale === 'en-US'
            ? 'Ad revenue helps PPanel continue to release updates'
            : '广告收入有助于 PPanel 继续发布更新'}
        </span>
      </h1>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-5'>
        {data[type].map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Link href={item.href} target='_blank'>
                <Card className='cursor-pointer'>
                  <CardHeader className='flex flex-row items-center gap-2 p-3'>
                    <Avatar>
                      <AvatarImage src={item.logo} />
                      <AvatarFallback>{item.title}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription className='line-clamp-3'>{item.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </TooltipTrigger>
            <TooltipContent className='bg-muted text-muted-foreground'>
              <p className='mb-1'>{item.description}</p>
              <Image src={item.poster} width={400} height={300} unoptimized objectFit='cover' />
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
