'use client';

import { type Monaco } from '@monaco-editor/react';
import {
  MonacoEditor,
  MonacoEditorProps,
} from '@workspace/ui/custom-components/editor/monaco-editor';
import { useMemo } from 'react';
// Import Dracula theme
import DraculaTheme from 'monaco-themes/themes/Dracula.json' with { type: 'json' };

export interface GoTemplateEditorProps extends Omit<MonacoEditorProps, 'language'> {
  schema?: Record<string, unknown>;
  enableSprig?: boolean;
}

// Go template syntax keywords
const GO_TEMPLATE_KEYWORDS = [
  'if',
  'else',
  'end',
  'with',
  'range',
  'template',
  'define',
  'block',
  'and',
  'or',
  'not',
  'eq',
  'ne',
  'lt',
  'le',
  'gt',
  'ge',
  'print',
  'printf',
  'println',
];

// Sprig function list (commonly used)
const SPRIG_FUNCTIONS = [
  // String functions
  'trim',
  'trimAll',
  'trimSuffix',
  'trimPrefix',
  'upper',
  'lower',
  'title',
  'untitle',
  'repeat',
  'substr',
  'nospace',
  'trunc',
  'abbrev',
  'abbrevboth',
  'initials',
  'randAlphaNum',
  'randAlpha',
  'randNumeric',
  'wrap',
  'wrapWith',
  'contains',
  'hasPrefix',
  'hasSuffix',
  'quote',
  'squote',
  'cat',
  'indent',
  'nindent',
  'replace',
  'plural',
  'sha1sum',
  'sha256sum',
  'adler32sum',
  'htmlEscape',
  'htmlUnescape',
  'urlEscape',
  'urlUnescape',

  // Math functions
  'add',
  'sub',
  'mul',
  'div',
  'mod',
  'max',
  'min',
  'ceil',
  'floor',
  'round',

  // Date functions
  'now',
  'date',
  'dateInZone',
  'duration',
  'durationRound',
  'unixEpoch',
  'dateModify',
  'mustDateModify',
  'htmlDate',
  'htmlDateInZone',
  'toDate',
  'mustToDate',

  // Lists and Dict functions
  'list',
  'first',
  'rest',
  'last',
  'initial',
  'reverse',
  'uniq',
  'compact',
  'slice',
  'has',
  'set',
  'unset',
  'hasKey',
  'pluck',
  'keys',
  'pick',
  'omit',
  'merge',
  'mergeOverwrite',
  'values',
  'append',
  'prepend',
  'concat',
  'dict',
  'get',
  'index',
  'dig',

  // Type functions
  'typeOf',
  'typeIs',
  'typeIsLike',
  'kindOf',
  'kindIs',
  'deepEqual',

  // Default functions
  'default',
  'empty',
  'coalesce',
  'fromJson',
  'toJson',
  'toPrettyJson',
  'toRawJson',
  'mustFromJson',
  'mustToJson',
  'mustToPrettyJson',

  // Encoding functions
  'b64enc',
  'b64dec',
  'b32enc',
  'b32dec',

  // Flow control
  'fail',
  'required',
  'tpl',

  // UUID functions
  'uuidv4',

  // OS functions
  'env',
  'expandenv',
];

export function GoTemplateEditor({ schema, enableSprig = true, ...props }: GoTemplateEditorProps) {
  const completionItems = useMemo(() => {
    const items = [];

    // Add Go template keywords
    items.push(
      ...GO_TEMPLATE_KEYWORDS.map((keyword) => ({
        label: keyword,
        kind: 14,
        insertText: keyword,
        documentation: `Go template keyword: ${keyword}`,
      })),
    );

    // Add Sprig functions if enabled
    if (enableSprig) {
      items.push(
        ...SPRIG_FUNCTIONS.map((func) => ({
          label: func,
          kind: 3, // Function
          insertText: `${func} `,
          documentation: `Sprig function: ${func}`,
        })),
      );
    }

    // Add schema field completion
    if (schema && typeof schema === 'object') {
      const addSchemaFields = (schemaObj: Record<string, unknown>, prefix = '.') => {
        // Handle JSON Schema properties
        if (schemaObj.properties && typeof schemaObj.properties === 'object') {
          const properties = schemaObj.properties as Record<string, unknown>;
          Object.keys(properties).forEach((key) => {
            const property = properties[key] as Record<string, unknown>;
            const fullPath = prefix === '.' ? `.${key}` : `${prefix}.${key}`;
            const type = property.type || 'unknown';

            items.push({
              label: fullPath,
              kind: 10, // Property
              insertText: fullPath,
              documentation: `Schema field: ${fullPath} (${type})${property.description ? ` - ${property.description}` : ''}`,
            });

            // Recursively add nested object properties
            if (property.type === 'object' && property.properties) {
              addSchemaFields(property, fullPath);
            }
          });
        }
        // Handle direct object structure (non-JSON Schema format)
        else {
          Object.keys(schemaObj).forEach((key) => {
            if (key === 'properties' || key === 'type' || key === 'description') return;

            const value = schemaObj[key];
            const fullPath = prefix === '.' ? `.${key}` : `${prefix}.${key}`;

            items.push({
              label: fullPath,
              kind: 10, // Property
              insertText: fullPath,
              documentation: `Schema field: ${fullPath} (${typeof value})`,
            });

            if (value && typeof value === 'object' && !Array.isArray(value)) {
              addSchemaFields(value as Record<string, unknown>, fullPath);
            }
          });
        }
      };

      addSchemaFields(schema);
    }

    return items;
  }, [schema, enableSprig]);

  const handleEditorMount = (editor: unknown, monaco: Monaco) => {
    // Register custom Go template language
    monaco.languages.register({ id: 'gotemplate' });

    // Set syntax highlighting
    monaco.languages.setMonarchTokensProvider('gotemplate', {
      tokenizer: {
        root: [
          // Comments - match {{/*...*/}} first
          [/\{\{\/\*[\s\S]*?\*\/\}\}/, 'comment'],
          // Template tags - enter template state
          [/\{\{-?/, { token: 'template-tag', next: '@template' }],
          // Regular text
          [/[^{]+/, ''],
          [/[{]/, ''],
        ],
        template: [
          // Exit template
          [/-?\}\}/, { token: 'template-tag', next: '@pop' }],
          // Strings in template
          [/"([^"\\]|\\.)*"/, 'string'],
          [/'([^'\\]|\\.)*'/, 'string'],
          // Go template keywords - exact word match
          [new RegExp(`\\b(${GO_TEMPLATE_KEYWORDS.join('|')})\\b`), 'keyword'],
          // Sprig functions - exact word match
          [new RegExp(`\\b(${SPRIG_FUNCTIONS.join('|')})\\b`), 'function'],
          // Variables starting with $
          [/\$\w+/, 'variable'],
          // Properties starting with .
          [/\.\w+/, 'property'],
          // Numbers
          [/\d+(\.\d+)?/, 'number'],
          // Operators and other tokens
          [/[|:]/, 'operator'],
          // Whitespace
          [/\s+/, ''],
          // Any other characters in template
          [/./, ''],
        ],
        string: [
          [/[^\\"]+/, 'string'],
          [/\\./, 'string.escape'],
          [/"/, 'string', '@pop'],
        ],
        string_single: [
          [/[^\\']+/, 'string'],
          [/\\./, 'string.escape'],
          [/'/, 'string', '@pop'],
        ],
      },
    });

    // Override the Dracula theme with Go template colors
    monaco.editor.defineTheme('transparentTheme', {
      base: DraculaTheme.base as 'vs' | 'vs-dark' | 'hc-black',
      inherit: DraculaTheme.inherit,
      rules: [
        ...DraculaTheme.rules,
        { token: 'template-tag', foreground: 'FFB86C', fontStyle: 'bold' }, // Dracula orange for template tags
        { token: 'keyword', foreground: 'FF79C6' }, // Dracula pink for keywords
        { token: 'function', foreground: '50FA7B' }, // Dracula green for functions
        { token: 'variable', foreground: 'F1FA8C' }, // Dracula yellow for variables
        { token: 'property', foreground: '8BE9FD' }, // Dracula cyan for properties
        { token: 'operator', foreground: 'FF79C6' }, // Dracula pink for operators
      ],
      colors: {
        'editor.background': '#00000000',
      },
    });

    // Force theme refresh
    const editorInstance = editor as { updateOptions?: (options: unknown) => void };
    if (editorInstance && editorInstance.updateOptions) {
      editorInstance.updateOptions({ theme: 'transparentTheme' });
    }

    // Register auto-completion
    monaco.languages.registerCompletionItemProvider('gotemplate', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      provideCompletionItems: (model: any, position: any) => {
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: position.column,
          endColumn: position.column,
        };

        return {
          suggestions: completionItems.map((item) => ({
            ...item,
            range,
          })),
        };
      },
    });

    // Register hover provider
    monaco.languages.registerHoverProvider('gotemplate', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      provideHover: (model: any, position: any) => {
        const word = model.getWordAtPosition(position);
        if (word) {
          const wordText = word.word;

          if (GO_TEMPLATE_KEYWORDS.includes(wordText)) {
            return {
              range: new monaco.Range(
                position.lineNumber,
                word.startColumn,
                position.lineNumber,
                word.endColumn,
              ),
              contents: [{ value: `**Go Template Keyword**: ${wordText}` }],
            };
          }

          if (SPRIG_FUNCTIONS.includes(wordText)) {
            return {
              range: new monaco.Range(
                position.lineNumber,
                word.startColumn,
                position.lineNumber,
                word.endColumn,
              ),
              contents: [{ value: `**Sprig Function**: ${wordText}` }],
            };
          }
        }

        return null;
      },
    });

    if (props.onMount) {
      props.onMount(editor as Parameters<NonNullable<typeof props.onMount>>[0], monaco);
    }
  };

  return (
    <MonacoEditor
      title='Go Template Editor'
      description={`Go text/template syntax${enableSprig ? ' with Sprig functions' : ''}`}
      {...props}
      language='gotemplate'
      placeholder='Enter your Go template here...'
      onMount={handleEditorMount}
    />
  );
}
