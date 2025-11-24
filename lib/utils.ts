import { type ClassValue, clsx } from 'clsx';
import crypto from 'crypto';
import { ClassNamesConfig } from 'react-select';
import { twMerge } from 'tailwind-merge';

import { Prisma } from './generated/prisma/client';
import { PageParams } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getUserName = (user: Pick<Prisma.usersModel, 'name' | 'alternative_name'> | null) => {
  if (!user) {
    return '';
  }
  return user.name ? `@${user.name}` : user.alternative_name;
};

export const getSelectClassNames = <T>(error?: string): ClassNamesConfig<T> => ({
  control: ({ isFocused }) =>
    cn(
      'flex !min-h-0 rounded-md border border-input bg-background px-3 py-[3px] text-sm shadow-sm transition-colors',
      'placeholder:text-muted-foreground focus-visible:outline-none',
      'disabled:cursor-not-allowed disabled:opacity-50',
      isFocused && 'ring-1 ring-ring',
      error && 'border-destructive ring-destructive',
    ),
  placeholder: () => 'text-muted-foreground',
  input: () => 'text-sm',
  menu: () => 'mt-2 rounded-md border bg-popover text-popover-foreground shadow-md py-1',
  menuList: () => 'text-sm',
  option: ({ isFocused, isSelected }) =>
    cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 outline-none transition-colors',
      isSelected && 'bg-primary text-primary-foreground',
      isFocused && !isSelected && 'bg-accent text-accent-foreground',
      !isFocused && !isSelected && 'text-popover-foreground hover:bg-accent hover:text-accent-foreground',
    ),
  multiValue: () => 'inline-flex items-center bg-secondary text-secondary-foreground mr-1',
  multiValueLabel: () => 'px-2 text-xs leading-none',
  multiValueRemove: () =>
    cn('flex items-center justify-center p-1', 'hover:bg-destructive hover:text-destructive-foreground'),
  valueContainer: () => 'gap-1 flex flex-wrap items-center',
  clearIndicator: () => 'p-1 text-muted-foreground hover:text-foreground',
  dropdownIndicator: () => 'p-1 text-muted-foreground hover:text-foreground',
  indicatorSeparator: () => 'bg-input mx-2 my-2 w-[1px]',
  noOptionsMessage: () => 'text-muted-foreground p-2 text-sm',
});

export const isAuthenticated = (hash: string | undefined) => {
  return (
    hash &&
    hash ===
      crypto.createHash('sha512').update(`${process.env['ADMIN_LOGIN']}:${process.env['ADMIN_PASSWORD']}`).digest('hex')
  );
};

export const getPageNumber = async ({ searchParams }: PageParams) => {
  const pageParam = (await searchParams).page;
  let page = Number(pageParam);

  if (isNaN(page)) {
    page = 1;
  } else if (page < 1) {
    page = 1;
  }

  return page;
};
