import sharedConfig from '@shadcn/ui/tailwind.config';
import type { Config } from 'tailwindcss';

const config: Config = {
  ...sharedConfig,
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    '../../packages/shadcn/src/components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};
export default config;
