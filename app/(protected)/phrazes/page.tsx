import { AddPhrazeForm } from '@/components/app/add-phraze-form';
import { PhrazeKeyFilter } from '@/components/app/phraze-key-filter';
import { PhrazesRow } from '@/components/app/phrazes-row';
import { TableWrapper } from '@/components/app/table-wrapper';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PAGE_SIZE } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { PageParams } from '@/lib/types';
import { getPageNumberFromSearchParams } from '@/lib/utils';

export default async function Page(params: PageParams) {
  const pageParams = await params.searchParams;

  const page = getPageNumberFromSearchParams(pageParams);
  const key = Array.isArray(pageParams['key']) ? pageParams['key'][0] : pageParams['key'];

  const where = key ? { key } : {};

  const [data, total] = await Promise.all([
    prisma.phrazes.findMany({
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      where,
      orderBy: [{ key: 'asc' }, { group: 'asc' }, { order: 'asc' }],
    }),
    prisma.phrazes.aggregate({ _count: true, where }),
  ]);

  const newParams: string[][] = [];
  Object.entries(pageParams).forEach(([k, v]) => {
    if (v === undefined || k === 'page') {
      return;
    }

    if (Array.isArray(v)) {
      v.forEach((item) => {
        newParams.push([k, item]);
      });
    } else {
      newParams.push([k, v]);
    }
  });

  return (
    <TableWrapper
      title="Фразы"
      pagination={{
        generateLink: (pageNumber) => {
          const urlParams = new URLSearchParams([...newParams, ['page', String(pageNumber)]]);
          return `/phrazes?${urlParams.toString()}`;
        },
        page,
        totalItems: total._count,
      }}
    >
      <div className="flex flex-wrap items-center gap-4">
        <AddPhrazeForm />
        <PhrazeKeyFilter baseUrl="phrazes" />
      </div>

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
