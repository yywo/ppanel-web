import Providers from '@/components/providers';
import { geistMono, geistSans } from '@/config/fonts';
import { getGlobalConfig } from '@/services/common/common';
import { queryUserInfo } from '@/services/user/user';
import '@shadcn/ui/globals.css';
import { Toaster } from '@shadcn/ui/sonner';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { PublicEnvScript } from 'next-runtime-env';
import { cookies } from 'next/headers';
import { Metadata } from 'next/types';
import NextTopLoader from 'nextjs-toploader';
import React from 'react';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getGlobalConfig({ skipErrorHandler: true }).then((res) => res.data.data!);
  const site = config?.site || {};
  return {
    title: {
      default: `${site.site_name}`,
      template: `%s | ${site.site_name}`,
    },
    description: site.site_desc,
    icons: {
      icon: site.site_logo
        ? [
            {
              url: site.site_logo,
              sizes: 'any',
            },
          ]
        : [],
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  let config, user;

  try {
    config = await getGlobalConfig({ skipErrorHandler: true }).then((res) => res.data.data);
  } catch (error) {
    /* empty */
  }

  try {
    user = await queryUserInfo({
      skipErrorHandler: true,
      Authorization: (await cookies()).get('Authorization')?.value,
    }).then((res) => res.data.data);
  } catch (error) {
    /* empty */
  }

  return (
    <html suppressHydrationWarning lang={locale}>
      <head>
        <PublicEnvScript />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} size-full min-h-[calc(100dvh-env(safe-area-inset-top))] antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <NextTopLoader showSpinner={false} />
          <Providers common={{ ...config }} user={user}>
            <Toaster richColors closeButton />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
