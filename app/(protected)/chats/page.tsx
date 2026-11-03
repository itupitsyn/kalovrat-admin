import { BirthdaysEnabledCell } from '@/components/app/birthdays-enabled-cell';
import { IsUncensoredCell } from '@/components/app/is-uncensored-cell';
import { SectionTabs } from '@/components/app/section-tabs';
import { TableWrapper } from '@/components/app/table-wrapper';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CHAT_TABS, PAGE_SIZE } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { PageParams } from '@/lib/types';
import { getPageNumber } from '@/lib/utils';

export default async function Page(params: PageParams) {
  const page = await getPageNumber(params);

  const [data, total] = await Promise.all([
    prisma.chats.findMany({
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.chats.aggregate({ _count: true }),
  ]);

  return (
    <TableWrapper
      title="Чаты"
      pagination={{
        generateLink: (pageNumber) => `/chats?page=${pageNumber}`,
        page,
        totalItems: total._count,
      }}
    >
      <SectionTabs tabs={CHAT_TABS} activeUrl="/chats" />

      <Table className="mt-4 w-auto">
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Название</TableHead>
            <TableHead>Без цензуры</TableHead>
            <TableHead>Дни рождения</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <IsUncensoredCell chat_id={item.id} is_uncensored={item.is_uncensored} />
              <BirthdaysEnabledCell chat_id={item.id} birthdays_enabled={item.birthdays_enabled} />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}
