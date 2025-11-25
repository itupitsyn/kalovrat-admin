import { TableWrapper } from '@/components/app/table-wrapper';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PAGE_SIZE } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { PageParams } from '@/lib/types';
import { getPageNumber } from '@/lib/utils';

export default async function Page(params: PageParams) {
  const page = await getPageNumber(params);
  const [data, total] = await Promise.all([
    prisma.users.findMany({
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.users.aggregate({ _count: true }),
  ]);

  return (
    <TableWrapper
      title="Пользователи"
      pagination={{
        generateLink: (pageNumber) => `/users?page=${pageNumber}`,
        page,
        totalItems: total._count,
      }}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>@{item.name}</TableCell>
              <TableCell>{item.alternative_name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}
