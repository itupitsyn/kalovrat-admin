'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FC, useEffect, useRef, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

import { Input } from '../ui/input';

interface SearchInputProps {
  baseUrl: string;
}

export const SearchInput: FC<SearchInputProps> = ({ baseUrl }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams);

  const [input, setInput] = useState(searchParams.get('search') || '');
  const [inputDeb] = useDebounceValue(input, 300);

  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  const pushRef = useRef(router.push);
  useEffect(() => {
    pushRef.current = router.push;
  }, [router.push]);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = new URLSearchParams(searchParamsRef.current.toString());
    if (inputDeb) {
      params.set('search', inputDeb);
    } else {
      params.delete('search');
    }

    pushRef.current(`/${baseUrl}?${params.toString()}`, {
      scroll: true,
    });
  }, [baseUrl, inputDeb]);

  return (
    <Input
      className="w-auto"
      placeholder="Поиск..."
      value={input}
      onChange={(e) => {
        setInput(e.target.value);
      }}
    />
  );
};
