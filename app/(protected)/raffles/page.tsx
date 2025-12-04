import { format } from 'date-fns';

import { TableWrapper } from '@/components/app/table-wrapper';
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
    <TableWrapper
      title="Розыгрыши"
      pagination={{
        generateLink: (pageNumber) => `/raffles?page=${pageNumber}`,
        page,
        totalItems: total._count,
      }}
    >
      <Table className="w-auto">
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
                <TableCell className="align-top">{formattedDate}</TableCell>
                <TableCell className="max-w-lg overflow-hidden align-top text-ellipsis whitespace-break-spaces">
                  {item.chats.name}
                </TableCell>
                <TableCell className="max-w-lg overflow-hidden align-top text-ellipsis whitespace-break-spaces">
                  {prize?.name}
                </TableCell>
                <TableCell className="align-top">{getUserName(item.users)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}
