import { AiLimitTextForm } from '@/components/app/ai-limit-text-form';
import { SearchInput } from '@/components/app/search-input';
import { TableWrapper } from '@/components/app/table-wrapper';
import { SerializableAiBalance, UserBalanceCell } from '@/components/app/user-balance-cell';
import { SerializableAiLimit, UserLimitCell } from '@/components/app/user-limit-cell';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AI_LIMIT_SETTINGS_ID, PAGE_SIZE } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { PageParams } from '@/lib/types';
import { getPageNumberFromSearchParams } from '@/lib/utils';

// Начало окна для периода. Неизвестный период даёт «никогда», и расход тогда
// показывается нулевым — лучше, чем падение страницы из-за опечатки в базе.
const windowStart = (period: string) => {
  const hours = { hour: 1, day: 24, week: 24 * 7 }[period];

  return hours ? new Date(Date.now() - hours * 60 * 60 * 1000) : new Date();
};

export default async function Page(params: PageParams) {
  const pageParams = await params.searchParams;

  const page = getPageNumberFromSearchParams(pageParams);
  const search = Array.isArray(pageParams['search']) ? pageParams['search'][0] : pageParams['search'];

  let where: Record<string, unknown> = {};
  if (search) {
    const trimmed = search.trim();
    const idCondition = /^-?\d+$/.test(trimmed) ? [{ id: BigInt(trimmed) }] : [];

    where = {
      OR: [
        ...idCondition,
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

  const [data, total, settings] = await Promise.all([
    prisma.users.findMany({
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      where,
    }),
    prisma.users.aggregate({ _count: true, where }),
    prisma.ai_limit_settings.findUnique({ where: { id: AI_LIMIT_SETTINGS_ID } }),
  ]);

  const ids = data.map((item) => item.id);

  // Лимиты есть у единиц, поэтому расход считаем только для них, и только для
  // тех, кто попал на эту страницу. Окно скользящее: отсчитываем назад от
  // сейчас, а не от начала часа.
  const limitRows = await prisma.ai_limits.findMany({
    where: { user_id: { in: ids } },
  });

  const limits = new Map<string, SerializableAiLimit>(
    await Promise.all(
      limitRows.map(async (row) => {
        const used = await prisma.ai_usages.aggregate({
          _sum: { units: true },
          where: { user_id: row.user_id, created_at: { gt: windowStart(row.period) } },
        });

        return [
          String(row.user_id),
          {
            amount: row.amount,
            period: row.period,
            message: row.message,
            used: used._sum.units ?? 0,
          },
        ] as const;
      }),
    ),
  );

  // Купленное считаем двумя запросами на всю страницу, а не по человеку:
  // карманов мало, а платежей у плательщика сотни, и складывать их по одному
  // значило бы PAGE_SIZE запросов ради одной графы.
  const [creditRows, purchaseRows] = await Promise.all([
    prisma.ai_credits.findMany({ where: { user_id: { in: ids } } }),
    prisma.ai_purchases.groupBy({
      by: ['user_id'],
      where: { user_id: { in: ids } },
      _sum: { stars: true },
      _count: { charge_id: true },
    }),
  ]);

  // Карман и платежи сходятся по человеку, но существовать могут и по
  // отдельности: всё истратил — остаётся строка с нулём, а платежей нет у
  // того, кому баллы начислили руками.
  const balances = new Map<string, SerializableAiBalance>();
  creditRows.forEach((row) => {
    balances.set(String(row.user_id), { balance: Number(row.balance), stars: 0, purchases: 0 });
  });
  purchaseRows.forEach((row) => {
    const key = String(row.user_id);
    const pocket = balances.get(key) ?? { balance: 0, stars: 0, purchases: 0 };

    balances.set(key, {
      ...pocket,
      stars: Number(row._sum.stars ?? 0),
      purchases: row._count.charge_id,
    });
  });

  const newParams: string[][] = [];
  Object.entries(pageParams).forEach(([k, v]) => {
    if (v === undefined) {
      return;
    }

    if (k === 'page') {
      return;
    } else if (Array.isArray(v)) {
      v.forEach((item) => {
        newParams.push([k, item]);
      });
    } else {
      newParams.push([k, v]);
    }
  });

  return (
    <TableWrapper
      title="Пользователи"
      pagination={{
        generateLink: (pageNumber) => {
          const urlParams = new URLSearchParams([...newParams, ['page', String(pageNumber)]]);
          return `/users?${urlParams.toString()}`;
        },
        page,
        totalItems: total._count,
      }}
    >
      <SearchInput baseUrl="users" />

      <AiLimitTextForm message={settings?.message ?? ''} />

      <Table className="mt-4 w-auto">
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Купленные баллы</TableHead>
            <TableHead>Лимит нейронок</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>@{item.name}</TableCell>
              <TableCell>{item.alternative_name}</TableCell>
              <TableCell className="align-top">
                <UserBalanceCell balance={balances.get(String(item.id)) ?? null} />
              </TableCell>
              <TableCell>
                <UserLimitCell userId={String(item.id)} limit={limits.get(String(item.id)) ?? null} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}
