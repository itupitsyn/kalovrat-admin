import { AddRoleForm } from '@/components/app/add-role-form';
import { RolesRow } from '@/components/app/roles-row';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import prisma from '@/lib/prisma';

export default async function Page() {
  const dataPromise = prisma.chat_user_roles.findMany({
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
  });

  const [data, chats, users, roles] = await Promise.all([
    dataPromise,
    prisma.chats.findMany(),
    prisma.users.findMany(),
    prisma.roles.findMany(),
  ]);

  return (
    <div className="ml-10 flex flex-col items-start overflow-x-auto">
      <div className="overflow-hidden">
        <h1 className="text-4xl font-semibold">Разрешения</h1>

        <div className="pt-10">
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
        </div>
      </div>
    </div>
  );
}
