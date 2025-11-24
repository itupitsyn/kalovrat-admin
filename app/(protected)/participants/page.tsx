import { format } from 'date-fns';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import prisma from '@/lib/prisma';
import { getUserName } from '@/lib/utils';

const PAGE_SIZE = 20;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const pageParam = (await searchParams).page;
  let page = Number(pageParam);

  if (isNaN(page)) {
    page = 1;
  } else if (page < 1) {
    page = 1;
  }

  const [data, total] = await Promise.all([
    prisma.participants.findMany({
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        raffle_date: true,
        raffle_chat_id: true,
        user_id: true,
        users: true,
        raffles: {
          select: {
            chats: true,
          },
        },
      },
      orderBy: [
        {
          raffle_date: 'desc',
        },
        {
          raffles: {
            chats: {
              name: 'asc',
            },
          },
        },
      ],
    }),
    prisma.participants.aggregate({ _count: true }),
  ]);

  const maxPage = Math.ceil(total._count / PAGE_SIZE);

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

  return (
    <div className="ml-10 flex flex-col items-start overflow-hidden">
      <div className="overflow-hidden">
        <h1 className="text-4xl font-semibold">Участники</h1>

        <div className="pt-10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>ID чата</TableHead>
                <TableHead>ID пользователя</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.map((item) => (
                <TableRow key={`${item.raffle_date}-${item.raffle_chat_id}-${item.user_id}`}>
                  <TableCell>{format(item.raffle_date, 'yyyy-MM-dd')}</TableCell>
                  <TableCell>{item.raffles.chats.name}</TableCell>
                  <TableCell>{getUserName(item.users)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {maxPage > 1 && (
            <Pagination className="justify-start pt-6">
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious href={`/participants?page=${page - 1}`} />
                  </PaginationItem>
                )}

                {page > 2 && (
                  <PaginationItem>
                    <PaginationLink href={`/participants`}>{1}</PaginationLink>
                  </PaginationItem>
                )}

                {page > 3 && maxPage > 4 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {pages.map((item) => (
                  <PaginationItem key={item}>
                    <PaginationLink href={`/participants?page=${item}`} isActive={item === page}>
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {page < maxPage - 2 && maxPage > 4 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {page <= maxPage - 2 && (
                  <PaginationItem>
                    <PaginationLink href={`/participants?page=${maxPage}`}>{maxPage}</PaginationLink>
                  </PaginationItem>
                )}

                {page < maxPage && (
                  <PaginationItem>
                    <PaginationNext href={`/participants?page=${page + 1}`} />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  );
}
