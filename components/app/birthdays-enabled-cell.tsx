'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Checkbox } from '../ui/checkbox';
import { TableCell } from '../ui/table';

interface IBirthdaysEnabledCellProps {
  birthdays_enabled: boolean | null;
  chat_id: bigint;
}

export const BirthdaysEnabledCell: FC<IBirthdaysEnabledCellProps> = ({ chat_id, birthdays_enabled }) => {
  const { refresh } = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const update = useCallback(
    async (val: boolean) => {
      try {
        setIsLoading(true);
        await axios.put('/api/chats', {
          chat_id: String(chat_id),
          birthdays_enabled: val,
        });
        refresh();
      } catch {
        toast.error('Ошибка обновления напоминаний');
      } finally {
        setIsLoading(false);
      }
    },
    [chat_id, refresh],
  );

  return (
    <TableCell className="text-center">
      <Checkbox checked={!!birthdays_enabled} onCheckedChange={update} disabled={isLoading} />
    </TableCell>
  );
};
