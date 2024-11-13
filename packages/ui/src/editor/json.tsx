'use client';

import { useMemo } from 'react';
import { MonacoEditor, MonacoEditorProps } from './monaco-editor';

interface JSONEditorProps extends Omit<MonacoEditorProps, 'placeholder'> {
  schema?: Record<string, unknown>;
  placeholder?: Record<string, unknown>;
}

export function JSONEditor(props: JSONEditorProps) {
  const { schema, placeholder = {}, ...rest } = props;

  const editorKey = useMemo(() => JSON.stringify({ schema, placeholder }), [schema, placeholder]);

  return (
    <MonacoEditor
      key={editorKey}
      title='Edit JSON'
      {...rest}
      placeholder={JSON.stringify(placeholder, null, 2)}
      language='json'
      onMount={(editor, monaco) => {
        if (props.onMount) props.onMount(editor, monaco);
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: true,
          schemas: [
            {
              uri: '',
              fileMatch: ['*'],
              schema: schema || {
                type: 'object',
                properties: generateSchema(placeholder),
              },
            },
          ],
        });
      }}
    />
  );
}

const generateSchema = (obj: Record<string, unknown>): Record<string, SchemaProperty> => {
  const properties: Record<string, SchemaProperty> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      properties[key] = {
        type: 'array',
        items: value.length > 0 ? generateSchema({ item: value[0] }).item : { type: 'null' },
      };
    } else if (typeof value === 'object' && value !== null) {
      properties[key] = {
        type: 'object',
        properties: generateSchema(value as Record<string, unknown>),
      };
    } else {
      properties[key] = { type: typeof value as SchemaType };
    }
  }
  return properties;
};

type SchemaType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';
interface SchemaProperty {
  type: SchemaType;
  items?: SchemaProperty;
  properties?: Record<string, SchemaProperty>;
}
