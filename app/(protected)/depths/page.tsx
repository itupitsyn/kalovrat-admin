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
    prisma.depths.findMany({
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: [{ date: 'desc' }, { user_id: 'asc' }],
    }),
    prisma.depths.aggregate({ _count: true }),
  ]);

  const users = await prisma.users.findMany({
    where: {
      id: {
        in: data.map((item) => item.user_id),
      },
    },
  });

  return (
    <TableWrapper
      title="Глубины"
      pagination={{
        generateLink: (pageNumber) => `/depths?page=${pageNumber}`,
        page,
        totalItems: total._count,
      }}
    >
      <Table className="w-auto">
        <TableHeader>
          <TableRow>
            <TableHead>Дата</TableHead>
            <TableHead>Пользователь</TableHead>
            <TableHead>Значение</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item) => {
            const user = users.find((user) => user.id === item.user_id);

            return (
              <TableRow key={`${format(item.date, 'yyyy-MM-dd')}-${item.user_id}`}>
                <TableCell>{format(item.date, 'yyyy-MM-dd')}</TableCell>
                <TableCell>{user ? getUserName(user) : String(item.user_id)}</TableCell>
                <TableCell>{String(item.value)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}
