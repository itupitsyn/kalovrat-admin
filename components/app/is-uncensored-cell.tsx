'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Checkbox } from '../ui/checkbox';
import { TableCell } from '../ui/table';

interface IsUncensoredCellProps {
  is_uncensored: boolean | null;
  chat_id: bigint;
}

export const IsUncensoredCell: FC<IsUncensoredCellProps> = ({ chat_id, is_uncensored }) => {
  const { refresh } = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const updateChatCensorship = useCallback(
    async (val: boolean) => {
      try {
        setIsLoading(true);
        await axios.put('/api/chats', {
          chat_id: String(chat_id),
          is_uncensored: val,
        });
        refresh();
      } catch {
        toast.error('Ошибка обновления цензуры');
      } finally {
        setIsLoading(false);
      }
    },
    [chat_id, refresh],
  );

  return (
    <TableCell className="text-center">
      <Checkbox checked={!!is_uncensored} onCheckedChange={updateChatCensorship} disabled={isLoading} />
    </TableCell>
  );
};
