import { AddPhrazeForm } from '@/components/app/add-phraze-form';
import { PhrazeKeyFilter } from '@/components/app/phraze-key-filter';
import { PhrazeRow, SerializablePhraze } from '@/components/app/phraze-row';
import { TableWrapper } from '@/components/app/table-wrapper';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PAGE_SIZE } from '@/lib/constants';
import { Prisma } from '@/lib/generated/prisma/client';
import prisma from '@/lib/prisma';
import { PageParams } from '@/lib/types';
import { getPageNumberFromSearchParams } from '@/lib/utils';

interface Row {
  key: string;
  group: string | null;
  phrazes: SerializablePhraze[];
}

const serialize = (item: Prisma.phrazesModel): SerializablePhraze => ({
  key: item.key,
  value: item.value,
  is_uncensored: item.is_uncensored,
  is_with_spoiler: item.is_with_spoiler,
  group: item.group != null ? String(item.group) : null,
  order: item.order != null ? String(item.order) : null,
});

export default async function Page(params: PageParams) {
  const pageParams = await params.searchParams;

  const page = getPageNumberFromSearchParams(pageParams);
  const key = Array.isArray(pageParams['key']) ? pageParams['key'][0] : pageParams['key'];

  const where = key ? { key } : {};

  const all = await prisma.phrazes.findMany({
    where,
    orderBy: [{ key: 'asc' }, { group: 'asc' }, { order: 'asc' }],
  });

  // Фразы без группы — отдельные строки; фразы с группой сворачиваются в одну строку на пару (key, group).
  const rows: Row[] = [];
  for (const item of all) {
    if (item.group == null) {
      rows.push({ key: item.key, group: null, phrazes: [serialize(item)] });
      continue;
    }

    const groupValue = String(item.group);
    const last = rows[rows.length - 1];
    if (last && last.group === groupValue && last.key === item.key) {
      last.phrazes.push(serialize(item));
    } else {
      rows.push({ key: item.key, group: groupValue, phrazes: [serialize(item)] });
    }
  }

  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
        totalItems: rows.length,
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
            <TableHead />
          </TableRow>
        </TableHeader>

        <TableBody>
          {pageRows.map((row) => (
            <PhrazeRow
              key={row.group != null ? `group-${row.key}-${row.group}` : `single-${row.key}-${row.phrazes[0].value}`}
              groupKey={row.key}
              group={row.group}
              phrazes={row.phrazes}
            />
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}
