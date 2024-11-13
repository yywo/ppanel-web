'use client';

import { Markdown } from '../markdown';
import { MonacoEditor, MonacoEditorProps } from './monaco-editor';

export function MarkdownEditor(props: MonacoEditorProps) {
  return (
    <MonacoEditor
      title='Markdown Editor'
      description='Support markdwon and html syntax'
      {...props}
      language='markdown'
      render={(value) => <Markdown>{value || ''}</Markdown>}
    />
  );
}
