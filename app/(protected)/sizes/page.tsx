import { MeasurementsTable } from '@/components/app/measurements-table';
import { SectionTabs } from '@/components/app/section-tabs';
import { TableWrapper } from '@/components/app/table-wrapper';
import { MEASUREMENTS_TITLE, MEASUREMENT_TABS, PAGE_SIZE } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { PageParams } from '@/lib/types';
import { getPageNumber } from '@/lib/utils';

export default async function Page(params: PageParams) {
  const page = await getPageNumber(params);

  const [data, total] = await Promise.all([
    prisma.sizes.findMany({
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: [{ date: 'desc' }, { user_id: 'asc' }],
    }),
    prisma.sizes.aggregate({ _count: true }),
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
      title={MEASUREMENTS_TITLE}
      pagination={{
        generateLink: (pageNumber) => `/sizes?page=${pageNumber}`,
        page,
        totalItems: total._count,
      }}
    >
      <SectionTabs tabs={MEASUREMENT_TABS} activeUrl="/sizes" />

      <div className="mt-4">
        <MeasurementsTable items={data} users={users} />
      </div>
    </TableWrapper>
  );
}
