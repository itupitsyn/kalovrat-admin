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
    prisma.raffles.findMany({
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { date: true, chats: true, users: true },
      orderBy: [{ date: 'desc' }, { chats: { name: 'asc' } }],
    }),
    prisma.raffles.aggregate({ _count: true }),
  ]);

  const prizes = await prisma.prizes.findMany({
    where: {
      chat_id: {
        in: data.map((item) => item.chats.id),
      },
      date: {
        in: data.map((item) => item.date),
      },
    },
  });

  return (
    <div className="ml-10 flex flex-col items-start overflow-x-auto">
      <div className="overflow-hidden">
        <h1 className="text-4xl font-semibold">Розыгрыши</h1>

        <div className="pt-10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Чат</TableHead>
                <TableHead>Приз</TableHead>
                <TableHead>Победитель</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.map((item) => {
                const formattedDate = format(item.date, 'yyyy-MM-dd');

                const prize = prizes.find(
                  (prize) => prize.date?.valueOf() === item.date.valueOf() && prize.chat_id === item.chats.id,
                );

                return (
                  <TableRow key={`${formattedDate}-${item.chats.id}`}>
                    <TableCell>{formattedDate}</TableCell>
                    <TableCell>{item.chats.name}</TableCell>
                    <TableCell>{prize?.name}</TableCell>
                    <TableCell>{getUserName(item.users)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <AppPagination
            page={page}
            totalItems={total._count}
            className="justify-start pt-6"
            generateLink={(pageNumber) => `/raffles?page=${pageNumber}`}
          />
        </div>
      </div>
    </div>
  );
}
