import { FC } from 'react';

import { PAGE_SIZE } from '@/lib/constants';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';

interface IPaginationProps {
  className?: string;
  generateLink: (page: number) => string;
  page: number;
  totalItems: number;
}

export const AppPagination: FC<IPaginationProps> = ({ generateLink, page, totalItems, className }) => {
  const maxPage = Math.ceil(totalItems / PAGE_SIZE);

  const pages: number[] = [];

  if (maxPage < 3) {
    for (let i = 1; i <= maxPage; i += 1) {
      pages.push(i);
    }
  } else if (page === 1) {
    pages.push(1, 2, 3);
  } else if (page === maxPage) {
    pages.push(maxPage - 2, maxPage - 1, maxPage);
  } else {
    pages.push(page - 1, page, page + 1);
  }
  if (maxPage <= 1) {
    return null;
  }

  return (
    <Pagination className={className}>
      <PaginationContent>
        {page > 1 && (
          <PaginationItem>
            <PaginationPrevious href={generateLink(page - 1)} />
          </PaginationItem>
        )}

        {page > 2 && maxPage > 3 && (
          <PaginationItem>
            <PaginationLink href={generateLink(1)}>{1}</PaginationLink>
          </PaginationItem>
        )}

        {page > 3 && maxPage > 4 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {pages.map((item) => (
          <PaginationItem key={item}>
            <PaginationLink href={generateLink(item)} isActive={item === page}>
              {item}
            </PaginationLink>
          </PaginationItem>
        ))}

        {page < maxPage - 2 && maxPage > 4 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {page <= maxPage - 2 && maxPage > 3 && (
          <PaginationItem>
            <PaginationLink href={generateLink(maxPage)}>{maxPage}</PaginationLink>
          </PaginationItem>
        )}

        {page < maxPage && (
          <PaginationItem>
            <PaginationNext href={generateLink(page + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};
