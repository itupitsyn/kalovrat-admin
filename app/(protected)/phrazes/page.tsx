import { AddPhrazeForm } from '@/components/app/add-phraze-form';
import { PhrazesRow } from '@/components/app/phrazes-row';
import { TableWrapper } from '@/components/app/table-wrapper';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PAGE_SIZE } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { PageParams } from '@/lib/types';
import { getPageNumber } from '@/lib/utils';

export default async function Page(params: PageParams) {
  const page = await getPageNumber(params);

  const [data, total] = await Promise.all([
    prisma.phrazes.findMany({
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: [{ key: 'asc' }, { group: 'asc' }, { order: 'asc' }],
    }),
    prisma.phrazes.aggregate({ _count: true }),
  ]);

  return (
    <TableWrapper
      title="Фразы"
      pagination={{
        generateLink: (pageNumber) => `/phrazes?page=${pageNumber}`,
        page,
        totalItems: total._count,
      }}
    >
      <AddPhrazeForm />

      <Table className="mt-4 w-auto">
        <TableHeader>
          <TableRow>
            <TableHead>Ключ</TableHead>
            <TableHead>Фраза</TableHead>
            <TableHead>Без цензуры</TableHead>
            <TableHead>Спойлер</TableHead>
            <TableHead>Группа</TableHead>
            <TableHead>Порядок в группе</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item) => (
            <PhrazesRow key={`${item.key}-${item.value}`} item={item} />
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}
