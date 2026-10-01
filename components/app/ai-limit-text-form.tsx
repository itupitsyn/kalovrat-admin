'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface IAiLimitTextFormProps {
  message: string;
}

/** Общий текст отказа: что бот скажет тем, у кого нет своей формулировки. */
export const AiLimitTextForm: FC<IAiLimitTextFormProps> = ({ message }) => {
  const { refresh } = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState } = useForm<{ message: string }>({
    defaultValues: { message },
  });

  const onSubmit = useCallback(
    async (data: { message: string }) => {
      setIsSubmitting(true);
      try {
        await axios.post('/api/limits', data);
        reset(data);
        refresh();
        toast.success('Сохранено');
      } catch {
        toast.error('Ошибка сохранения');
      } finally {
        setIsSubmitting(false);
      }
    },
    [refresh, reset],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex max-w-2xl items-center gap-2">
      <Input
        placeholder="Общий текст отказа по лимиту — пусто, значит стандартный"
        aria-label="Общий текст отказа"
        {...register('message')}
      />
      <Button type="submit" size="sm" disabled={isSubmitting || !formState.isDirty}>
        Сохранить
      </Button>
    </form>
  );
};
