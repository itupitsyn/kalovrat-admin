import { format } from 'date-fns';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import prisma from '@/lib/prisma';
import { getUserName } from '@/lib/utils';

export default async function Page() {
  const data = await prisma.participants.findMany({
    orderBy: [
      {
        raffle_date: 'desc',
      },
      {
        raffles: {
          chats: {
            name: 'asc',
          },
        },
      },
    ],
    select: {
      raffle_date: true,
      raffle_chat_id: true,
      user_id: true,
      users: true,
      raffles: {
        select: {
          chats: true,
        },
      },
    },
  });

  return (
    <div className="ml-10 flex flex-col items-start overflow-hidden">
      <div className="overflow-hidden">
        <h1 className="text-4xl font-semibold">Участники</h1>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>ID чата</TableHead>
                <TableHead>ID пользователя</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.map((item) => (
                <TableRow key={`${item.raffle_date}-${item.raffle_chat_id}-${item.user_id}`}>
                  <TableCell>{format(item.raffle_date, 'yyyy-MM-dd')}</TableCell>
                  <TableCell>{item.raffles.chats.name}</TableCell>
                  <TableCell>{getUserName(item.users)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
