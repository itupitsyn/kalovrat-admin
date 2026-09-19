import Link from 'next/link';
import { FC } from 'react';

import { cn } from '@/lib/utils';

interface ISectionTabsProps {
  tabs: { title: string; url: string }[];
  activeUrl: string;
}

// Табы внутри раздела — это обычные ссылки: у каждой вкладки своя страница со
// своей пагинацией, и переключать их без похода на сервер всё равно нечем.
export const SectionTabs: FC<ISectionTabsProps> = ({ tabs, activeUrl }) => {
  return (
    <div className="bg-muted text-muted-foreground inline-flex h-9 w-auto items-center justify-center rounded-lg p-1">
      {tabs.map((tab) => {
        const isActive = tab.url === activeUrl;

        return (
          <Link
            key={tab.url}
            href={tab.url}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'inline-flex h-7 items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
              isActive ? 'bg-background text-foreground shadow-sm' : 'hover:text-foreground',
            )}
          >
            {tab.title}
          </Link>
        );
      })}
    </div>
  );
};
