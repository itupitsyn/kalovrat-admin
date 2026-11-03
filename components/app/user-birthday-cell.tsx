'use client';

import axios from 'axios';
import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useState } from 'react';
import { toast } from 'sonner';

import { formatBirthday, parseBirthday } from '@/lib/birthday';

import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface IUserBirthdayCellProps {
  userId: string;
  birthday: string | null;
}

// Пустое поле — даты нет: стирается тем же полем, что и задаётся.
export const UserBirthdayCell: FC<IUserBirthdayCellProps> = ({ userId, birthday }) => {
  const { refresh } = useRouter();
  const saved = formatBirthday(birthday);
  const [value, setValue] = useState(saved);
  const [isLoading, setIsLoading] = useState(false);

  const onSave = useCallback(async () => {
    const text = value.trim();
    if (text !== '' && !parseBirthday(text)) {
      toast.error('Дата в формате 15.03');
      return;
    }

    try {
      setIsLoading(true);
      await axios.put('/api/birthdays', { user_id: userId, birthday: text });
      refresh();
      toast.success(text === '' ? 'Дата стёрта' : 'Сохранено');
    } catch {
      toast.error('Ошибка сохранения');
    } finally {
      setIsLoading(false);
    }
  }, [refresh, userId, value]);

  return (
    <div className="flex items-center gap-2">
      <Input
        className="w-20"
        placeholder="15.03"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
        }}
      />
      <Button size="icon-sm" variant="outline" onClick={onSave} disabled={isLoading || value.trim() === saved}>
        <Save />
      </Button>
    </div>
  );
};
