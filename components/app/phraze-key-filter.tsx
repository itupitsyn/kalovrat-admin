'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FC } from 'react';
import Select from 'react-select';

import { PHRAZE_KEY_OPTIONS } from '@/lib/constants';
import { getSelectClassNames } from '@/lib/utils';

interface PhrazeKeyFilterProps {
  baseUrl: string;
}

type PhrazeKeyOption = (typeof PHRAZE_KEY_OPTIONS)[number];

export const PhrazeKeyFilter: FC<PhrazeKeyFilterProps> = ({ baseUrl }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentKey = searchParams.get('key');
  const value = PHRAZE_KEY_OPTIONS.find((option) => option.value === currentKey) ?? null;

  return (
    <Select<PhrazeKeyOption>
      className="w-64"
      isClearable
      placeholder="Все категории"
      options={PHRAZE_KEY_OPTIONS}
      value={value}
      unstyled
      classNames={getSelectClassNames()}
      onChange={(option) => {
        const params = new URLSearchParams(searchParams.toString());
        if (option) {
          params.set('key', option.value);
        } else {
          params.delete('key');
        }
        params.delete('page');

        router.push(`/${baseUrl}?${params.toString()}`, { scroll: true });
      }}
    />
  );
};
