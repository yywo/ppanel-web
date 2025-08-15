'use client';

import { previewSubscribeTemplate } from '@/services/admin/application';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@workspace/ui/components/sheet';
import { Icon } from '@workspace/ui/custom-components/icon';
import { Markdown } from '@workspace/ui/custom-components/markdown';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface TemplatePreviewProps {
  applicationId: number;
  output_format?: string;
}

export function TemplatePreview({ applicationId, output_format }: TemplatePreviewProps) {
  const t = useTranslations('subscribe.templatePreview');
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['previewSubscribeTemplate', applicationId],
    queryFn: () => previewSubscribeTemplate({ id: applicationId }, { skipErrorHandler: true }),
    enabled: isOpen && !!applicationId,
    retry: false,
  });

  const originalContent = data?.data?.data?.template || '';
  const errorMessage = (error as any)?.data?.msg || error?.message || t('failed');
  const displayContent = originalContent || (error ? errorMessage : '');

  const getDecodedContent = () => {
    if (output_format === 'base64' && originalContent) {
      try {
        return atob(originalContent);
      } catch {
        return t('base64.decodeError');
      }
    }
    return '';
  };

  const getDisplayContent = () => {
    switch (output_format) {
      case 'base64':
        return `\`\`\`base64\n# ${t('base64.originalContent')}\n${displayContent}\n\n# ${t('base64.decodedContent')}\n${getDecodedContent()}\n\`\`\``;
      case 'yaml':
        return `\`\`\`yaml\n${displayContent}\n\`\`\``;
      case 'json':
        return `\`\`\`json\n${displayContent}\n\`\`\``;
      case 'conf':
        return `\`\`\`ini\n${displayContent}\n\`\`\``;
      case 'plain':
        return `\`\`\`text\n${displayContent}\n\`\`\``;
      default:
        return displayContent;
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
  };

  return (
    <>
      <Button variant='ghost' size='sm' onClick={() => setIsOpen(true)}>
        <Icon icon='mdi:eye' className='mr-2 h-4 w-4' />
        {t('preview')}
      </Button>
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent className='w-[800px] max-w-[90vw] md:max-w-screen-md'>
          <SheetHeader>
            <SheetTitle>{t('title')}</SheetTitle>
          </SheetHeader>
          {isLoading ? (
            <div className='flex items-center justify-center'>
              <Icon icon='mdi:loading' className='h-6 w-6 animate-spin' />
              <span className='ml-2'>{t('loading')}</span>
            </div>
          ) : (
            <div className='*:text-sm [&_pre>div>div+div]:max-h-[calc(100dvh-48px-36px-36px)] [&_pre>div>div+div]:overflow-auto'>
              <Markdown>{getDisplayContent()}</Markdown>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
