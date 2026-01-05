import { SearchInput } from '@/components/app/search-input';
import { TableWrapper } from '@/components/app/table-wrapper';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PAGE_SIZE } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { PageParams } from '@/lib/types';
import { getPageNumberFromSearchParams } from '@/lib/utils';

export default async function Page(params: PageParams) {
  const pageParams = await params.searchParams;

  const page = getPageNumberFromSearchParams(pageParams);
  const search = Array.isArray(pageParams['search']) ? pageParams['search'][0] : pageParams['search'];

  let where: Record<string, unknown> = {};
  if (search) {
    where = {
      OR: [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          alternative_name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    };
  }

  const [data, total] = await Promise.all([
    prisma.users.findMany({
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      where,
    }),
    prisma.users.aggregate({ _count: true, where }),
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
      <SearchInput baseUrl="users" />

      <Table className="mt-4 w-auto">
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
