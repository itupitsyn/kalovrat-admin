'use client';

import axios from 'axios';
import { Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useCallback } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';

interface IBirthdayReminderDeleteProps {
  chatId: string;
  userId: string;
}

export const BirthdayReminderDelete: FC<IBirthdayReminderDeleteProps> = ({ chatId, userId }) => {
  const { refresh } = useRouter();

  const onDelete = useCallback(async () => {
    try {
      await axios.delete('/api/birthdays', { data: { chat_id: chatId, user_id: userId } });
      toast.success('Запись успешно удалена');
      refresh();
    } catch {
      toast.error('Ошибка удаления записи');
    }
  }, [chatId, userId, refresh]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon-sm">
          <Trash />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Больше не напоминать?</AlertDialogTitle>
          <AlertDialogDescription>Дата рождения у пользователя останется</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>Удалить</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
