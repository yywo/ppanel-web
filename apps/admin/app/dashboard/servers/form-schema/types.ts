import { z } from 'zod';
import { protocols } from './constants';
import { formSchema } from './schemas';

export type FieldConfig = {
  name: string;
  type: 'input' | 'select' | 'switch' | 'number' | 'textarea';
  label: string;
  placeholder?: string | ((t: (key: string) => string, protocol: any) => string);
  options?: readonly string[];
  defaultValue?: any;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  generate?: {
    function: () => Promise<string | Record<string, string>> | string | Record<string, string>;
    updateFields?: Record<string, string>;
  };
  condition?: (protocol: any, values: any) => boolean;
  group?: 'basic' | 'transport' | 'security' | 'reality' | 'obfs' | 'encryption';
  gridSpan?: 1 | 2;
};

export type ServerFormValues = z.infer<typeof formSchema>;

export type ProtocolType = (typeof protocols)[number];
