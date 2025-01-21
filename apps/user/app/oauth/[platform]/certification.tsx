'use client';

import { oAuthLoginGetToken } from '@/services/common/oauth';
import { getRedirectUrl, setAuthorization } from '@/utils/common';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface CertificationProps {
  platform: string;
  children: React.ReactNode;
}

export default function Certification({ platform, children }: CertificationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    oAuthLoginGetToken({
      method: platform,
      code: searchParams.get('code') || '',
    })
      .then((res) => {
        const token = res?.data?.data?.token;
        if (!token) {
          throw new Error('Invalid token');
        }
        setAuthorization(token);
        router.replace(getRedirectUrl());
        router.refresh();
      })
      .catch((error) => {
        router.replace('/auth');
      });
  }, [platform, searchParams.values()]);

  return children;
}
