import { format } from 'date-fns';
import { FC } from 'react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Prisma } from '@/lib/generated/prisma/client';
import { getUserName } from '@/lib/utils';

// Размеры и глубины хранятся одинаково — дата, пользователь, число, — поэтому
// и таблица у обеих вкладок одна.
interface IMeasurementsTableProps {
  items: Pick<Prisma.sizesModel, 'user_id' | 'date' | 'value'>[];
  users: Prisma.usersModel[];
}

export const MeasurementsTable: FC<IMeasurementsTableProps> = ({ items, users }) => {
  return (
    <Table className="w-auto">
      <TableHeader>
        <TableRow>
          <TableHead>Дата</TableHead>
          <TableHead>Пользователь</TableHead>
          <TableHead>Значение</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {items.map((item) => {
          const user = users.find((user) => user.id === item.user_id);

          return (
            <TableRow key={`${format(item.date, 'yyyy-MM-dd')}-${item.user_id}`}>
              <TableCell>{format(item.date, 'yyyy-MM-dd')}</TableCell>
              <TableCell>{user ? getUserName(user) : String(item.user_id)}</TableCell>
              <TableCell>{String(item.value)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
