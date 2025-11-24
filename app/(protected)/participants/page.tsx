import { format } from 'date-fns';

import { AppPagination } from '@/components/app/app-pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PAGE_SIZE } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { PageParams } from '@/lib/types';
import { getPageNumber, getUserName } from '@/lib/utils';

export default async function Page(params: PageParams) {
  const page = await getPageNumber(params);

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

          <AppPagination
            page={page}
            totalItems={total._count}
            className="justify-start pt-6"
            generateLink={(pageNumber) => `/participants?page=${pageNumber}`}
          />
        </div>
      </div>
    </div>
  );
}
