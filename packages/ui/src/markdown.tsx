'use client';

import { Button } from '@shadcn/ui/button';
import { cn } from '@shadcn/ui/lib/utils';
import { ScrollArea } from '@shadcn/ui/scroll-area';
import 'katex/dist/katex.min.css';
import { Check, Copy } from 'lucide-react';
import { useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkToc from 'remark-toc';

interface CodeBlockProps {
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

function CodeBlock({ className, children, dark, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const match = className?.startsWith('language-') ? /language-(\w+)/.exec(className) : null;

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(() => {
        alert('Failed to copy text. Please try again.');
      });
  }, []);

  if (match) {
    return (
      <div className='group relative w-full'>
        <div className='bg-muted flex items-center justify-between gap-4 rounded-t-lg px-4 py-2 text-sm font-semibold'>
          <span className='lowercase [&>span]:text-xs'>{match[1]}</span>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => handleCopy(String(children).replace(/\n$/, ''))}
            className='absolute right-2 top-2 z-20 opacity-0 transition-opacity duration-200 group-hover:opacity-100'
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </Button>
        </div>

        <ScrollArea className='max-h-96 w-full overflow-auto'>
          <SyntaxHighlighter
            {...props}
            PreTag='div'
            language={match[1]}
            style={dark ? oneDark : oneLight}
            showLineNumbers
            customStyle={{
              margin: 0,
            }}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </ScrollArea>
      </div>
    );
  }

  return (
    <code {...props} className={cn(className, 'bg-muted rounded border font-semibold')}>
      {children}
    </code>
  );
}

interface MarkdownProps {
  children: string;
  dark?: false;
}

export function Markdown({ children, dark }: MarkdownProps) {
  return (
    <ReactMarkdown
      className='prose dark:prose-invert w-full max-w-[unset] break-words'
      remarkPlugins={[remarkGfm, remarkToc, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      components={{
        h1: ({ node, className, ...props }) => (
          <h1
            className={cn(
              'mb-8 scroll-m-20 text-4xl font-extrabold tracking-tight last:mb-0',
              className,
            )}
            {...props}
          />
        ),
        h2: ({ node, className, ...props }) => (
          <h2
            className={cn(
              'mb-4 mt-8 scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 last:mb-0',
              className,
            )}
            {...props}
          />
        ),
        h3: ({ node, className, ...props }) => (
          <h3
            className={cn(
              'mb-4 mt-6 scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 last:mb-0',
              className,
            )}
            {...props}
          />
        ),
        h4: ({ node, className, ...props }) => (
          <h4
            className={cn(
              'mb-4 mt-6 scroll-m-20 text-xl font-semibold tracking-tight first:mt-0 last:mb-0',
              className,
            )}
            {...props}
          />
        ),
        h5: ({ node, className, ...props }) => (
          <h5
            className={cn('my-4 text-lg font-semibold first:mt-0 last:mb-0', className)}
            {...props}
          />
        ),
        h6: ({ node, className, ...props }) => (
          <h6 className={cn('my-4 font-semibold first:mt-0 last:mb-0', className)} {...props} />
        ),
        p: ({ node, className, ...props }) => (
          <p className={cn('mb-5 mt-5 leading-7 first:mt-0 last:mb-0', className)} {...props} />
        ),
        a: ({ node, className, ...props }) => (
          <a
            target='_blank'
            className={cn('text-primary font-medium underline underline-offset-4', className)}
            {...props}
          />
        ),
        blockquote: ({ node, className, ...props }) => (
          <blockquote className={cn('border-l-2 pl-6 italic', className)} {...props} />
        ),
        ul: ({ node, className, ...props }) => (
          <ul className={cn('my-5 ml-6 list-disc [&>li]:mt-2', className)} {...props} />
        ),
        ol: ({ node, className, ...props }) => (
          <ol className={cn('my-5 ml-6 list-decimal [&>li]:mt-2', className)} {...props} />
        ),
        hr: ({ node, className, ...props }) => (
          <hr className={cn('my-5 border-b', className)} {...props} />
        ),
        table: ({ node, className, ...props }) => (
          <table
            className={cn(
              'my-5 w-full border-separate border-spacing-0 overflow-y-auto',
              className,
            )}
            {...props}
          />
        ),
        th: ({ node, className, ...props }) => (
          <th
            className={cn(
              'bg-muted px-4 py-2 text-left font-bold first:rounded-tl-lg last:rounded-tr-lg [&[align=center]]:text-center [&[align=right]]:text-right',
              className,
            )}
            {...props}
          />
        ),
        td: ({ node, className, ...props }) => (
          <td
            className={cn(
              'border-b border-l px-4 py-2 text-left last:border-r [&[align=center]]:text-center [&[align=right]]:text-right',
              className,
            )}
            {...props}
          />
        ),
        tr: ({ node, className, ...props }) => (
          <tr
            className={cn(
              'm-0 border-b p-0 first:border-t [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg',
              className,
            )}
            {...props}
          />
        ),
        sup: ({ node, className, ...props }) => (
          <sup className={cn('[&>a]:text-xs [&>a]:no-underline', className)} {...props} />
        ),
        pre: ({ node, className, ...props }) => (
          <pre className={cn('overflow-x-auto rounded-b-lg p-0', className)} {...props} />
        ),
        code(props) {
          return <CodeBlock {...(props as CodeBlockProps)} dark={dark} />;
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
