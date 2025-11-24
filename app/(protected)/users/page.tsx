import { AppPagination } from '@/components/app/app-pagination';
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
    <div className="ml-10 flex flex-col items-start overflow-x-auto">
      <div className="overflow-hidden">
        <h1 className="text-4xl font-semibold">Пользователи</h1>

        <div className="pt-10">
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

          <AppPagination
            page={page}
            totalItems={total._count}
            className="justify-start pt-6"
            generateLink={(pageNumber) => `/users?page=${pageNumber}`}
          />
        </div>
      </div>
    </div>
  );
}
