import { Input } from '@workspace/ui/components/input';
import { cn } from '@workspace/ui/lib/utils';
import { ChangeEvent, ReactNode, useEffect, useState } from 'react';

export interface EnhancedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  prefix?: string | ReactNode;
  suffix?: string | ReactNode;
  formatInput?: (value: string | number) => string;
  formatOutput?: (value: string | number) => string | number;
  onValueChange?: (value: string | number) => void;
  onValueBlur?: (value: string | number) => void;
  min?: number;
  max?: number;
}

export function EnhancedInput({
  suffix,
  prefix,
  formatInput,
  formatOutput,
  value: initialValue,
  className,
  onValueChange,
  onValueBlur,
  ...props
}: EnhancedInputProps) {
  const getProcessedValue = (inputValue: unknown) => {
    const newValue = inputValue === '' || inputValue === 0 ? '' : String(inputValue ?? '');
    return formatInput ? formatInput(newValue) : newValue;
  };

  const [value, setValue] = useState<string>(() => getProcessedValue(initialValue));

  useEffect(() => {
    if (initialValue !== value) {
      const newValue = getProcessedValue(initialValue);
      if (value !== newValue) setValue(newValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue, formatInput]);

  const processValue = (inputValue: string) => {
    let processedValue: number | string = inputValue?.toString().trim();
    if (processedValue && props.type === 'number') processedValue = Number(processedValue);
    return formatOutput ? formatOutput(processedValue) : processedValue;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    if (props.type === 'number' && inputValue) {
      const numericValue = Number(inputValue);
      if (!isNaN(numericValue)) {
        const min = Number.isFinite(props.min) ? props.min : -Infinity;
        const max = Number.isFinite(props.max) ? props.max : Infinity;
        inputValue = String(Math.max(min!, Math.min(max!, numericValue)));
      }
      setValue(inputValue === '0' ? '' : inputValue);
    } else {
      setValue(inputValue);
    }
    const outputValue = processValue(inputValue);
    console.log();
    onValueChange?.(outputValue);
  };

  const handleBlur = () => {
    const outputValue = processValue(value);
    if ((initialValue || '') !== outputValue) {
      onValueBlur?.(outputValue);
    }
  };
  const renderPrefix = () => {
    return typeof prefix === 'string' ? (
      <div className='bg-muted relative mr-px flex h-9 items-center text-nowrap px-3'>{prefix}</div>
    ) : (
      prefix
    );
  };
  const renderSuffix = () => {
    return typeof suffix === 'string' ? (
      <div className='bg-muted relative ml-px flex h-9 items-center text-nowrap px-3'>{suffix}</div>
    ) : (
      suffix
    );
  };

  return (
    <div
      className={cn(
        'border-input flex w-full items-center overflow-hidden rounded-md border',
        className,
      )}
      suppressHydrationWarning
    >
      {renderPrefix()}
      <Input
        {...props}
        value={value}
        className='rounded-none border-none'
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {renderSuffix()}
    </div>
  );
}
