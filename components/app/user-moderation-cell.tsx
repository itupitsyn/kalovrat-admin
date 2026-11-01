'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Checkbox } from '../ui/checkbox';
import { TableCell } from '../ui/table';

interface IUserModerationCellProps {
  userId: string;
  /** Под барьером ли этот человек. null — сервис генерации не ответил. */
  checked: boolean | null;
  /**
   * Общая цензура или принудительное включение в окружении: барьер и так у
   * всех, и галочка по человеку ничего не меняет — показываем это, а не
   * делаем вид, что щелчок работает.
   */
  everyone: boolean;
}

export const UserModerationCell: FC<IUserModerationCellProps> = ({ userId, checked, everyone }) => {
  const { refresh } = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const update = useCallback(
    async (value: boolean) => {
      try {
        setIsLoading(true);
        await axios.put('/api/moderation', { user_id: userId, enabled: value });
        refresh();
      } catch {
        toast.error('Сервис генерации не ответил — барьер не изменился');
      } finally {
        setIsLoading(false);
      }
    },
    [refresh, userId],
  );

  if (checked === null) {
    return (
      <TableCell className="text-muted-foreground text-center" title="Сервис генерации не ответил">
        —
      </TableCell>
    );
  }

  return (
    <TableCell className="text-center">
      <Checkbox
        checked={checked || everyone}
        disabled={isLoading || everyone}
        title={everyone ? 'Включена общая цензура: проверяются все' : undefined}
        onCheckedChange={(value) => update(value === true)}
      />
    </TableCell>
  );
};
