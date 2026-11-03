import { AddBirthdayReminderForm } from '@/components/app/add-birthday-reminder-form';
import { BirthdayReminderDelete } from '@/components/app/birthday-reminder-delete';
import { SectionTabs } from '@/components/app/section-tabs';
import { TableWrapper } from '@/components/app/table-wrapper';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatBirthday } from '@/lib/birthday';
import { CHAT_TABS, PAGE_SIZE } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { PageParams } from '@/lib/types';
import { getPageNumber, getUserName } from '@/lib/utils';

export default async function Page(params: PageParams) {
  const page = await getPageNumber(params);

  const [data, total, chats, users] = await Promise.all([
    prisma.birthday_reminders.findMany({
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { chats: true, users: true },
      orderBy: [{ chat_id: 'asc' }, { user_id: 'asc' }],
    }),
    prisma.birthday_reminders.aggregate({ _count: true }),
    prisma.chats.findMany(),
    prisma.users.findMany(),
  ]);

  return (
    <TableWrapper
      title="Чаты"
      pagination={{
        generateLink: (pageNumber) => `/chats/birthdays?page=${pageNumber}`,
        page,
        totalItems: total._count,
      }}
    >
      <SectionTabs tabs={CHAT_TABS} activeUrl="/chats/birthdays" />

      <div className="mt-4">
        <AddBirthdayReminderForm chats={chats} users={users} />
      </div>

      <Table className="mt-4 w-auto">
        <TableHeader>
          <TableRow>
            <TableHead>Чат</TableHead>
            <TableHead>Пользователь</TableHead>
            <TableHead>День рождения</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item) => (
            <TableRow key={`${item.chat_id}-${item.user_id}`}>
              <TableCell>{item.chats.name}</TableCell>
              <TableCell>{getUserName(item.users)}</TableCell>
              <TableCell>{formatBirthday(item.users.birthday) || 'не задан'}</TableCell>
              <TableCell>
                <BirthdayReminderDelete chatId={String(item.chat_id)} userId={String(item.user_id)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}
