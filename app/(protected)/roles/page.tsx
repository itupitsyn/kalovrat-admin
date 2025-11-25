import { AddRoleForm } from '@/components/app/add-role-form';
import { RolesRow } from '@/components/app/roles-row';
import { TableWrapper } from '@/components/app/table-wrapper';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PAGE_SIZE } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { PageParams } from '@/lib/types';
import { getPageNumber } from '@/lib/utils';

export default async function Page(params: PageParams) {
  const page = await getPageNumber(params);

  const dataPromise = Promise.all([
    prisma.chat_user_roles.findMany({
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        chat_id: true,
        role_id: true,
        user_id: true,
        chats: true,
        is_set_manually: true,
        roles: true,
        users: true,
      },
      orderBy: [{ chat_id: 'asc' }, { role_id: 'asc' }],
    }),
    prisma.chat_user_roles.aggregate({ _count: true }),
  ]);

  const [[data, total], chats, users, roles] = await Promise.all([
    dataPromise,
    prisma.chats.findMany(),
    prisma.users.findMany(),
    prisma.roles.findMany(),
  ]);

  return (
    <TableWrapper
      title="Разрешения"
      pagination={{
        generateLink: (pageNumber) => `/roles?page=${pageNumber}`,
        page,
        totalItems: total._count,
      }}
    >
      <AddRoleForm chats={chats} roles={roles} users={users} />

      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Чат</TableHead>
            <TableHead>Пользователь</TableHead>
            <TableHead>Роль</TableHead>
            <TableHead>Установлен вручную</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item) => {
            const key = `${item.chat_id}-${item.role_id}-${item.user_id}`;
            return <RolesRow key={key} item={item} roles={roles} />;
          })}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}
