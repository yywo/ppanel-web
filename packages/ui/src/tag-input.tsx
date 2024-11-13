import { Badge } from '@shadcn/ui/badge';
import { Input } from '@shadcn/ui/input';
import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface TagInputProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ value = [], onChange, placeholder }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<string[]>(value);

  useEffect(() => {
    setTags(value.map((tag) => tag.trim()).filter((tag) => tag));
  }, [value]);

  function addTag() {
    const newTag = inputValue.trim();
    if (newTag && !tags.includes(newTag)) {
      const newTags = [...tags, newTag];
      updateTags(newTags);
    }
    setInputValue('');
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTag();
    } else if (event.key === 'Backspace' && inputValue === '') {
      event.preventDefault();
      handleRemoveTag(tags.length - 1);
    }
  }

  function handleRemoveTag(index: number) {
    const newTags = tags.filter((_, i) => i !== index);
    updateTags(newTags);
  }

  function updateTags(newTags: string[]) {
    setTags(newTags);
    onChange?.(newTags);
  }

  return (
    <div className='border-input focus-within:ring-primary flex min-h-9 w-full flex-wrap items-center gap-2 rounded-md border bg-transparent p-2 shadow-sm transition-colors focus-within:ring-1'>
      {tags.map((tag, index) => (
        <Badge
          key={tag}
          variant='outline'
          className='border-primary bg-primary/10 flex items-center gap-1 px-1'
        >
          {tag}
          <X className='size-4 cursor-pointer' onClick={() => handleRemoveTag(index)} />
        </Badge>
      ))}
      <Input
        className='h-full min-w-48 flex-1 border-none bg-transparent p-0 shadow-none !ring-0'
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={placeholder}
      />
    </div>
  );
}

export default TagInput;
