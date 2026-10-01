'use client';

import axios from 'axios';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { AI_LIMIT_PERIODS } from '@/lib/constants';

import { Button } from '../ui/button';
import { Input } from '../ui/input';

export interface SerializableAiLimit {
  amount: number;
  period: string;
  message: string;
  /** Сколько человек уже израсходовал внутри окна. */
  used: number;
}

interface IUserLimitCellProps {
  userId: string;
  limit: SerializableAiLimit | null;
}

interface FormValues {
  amount: string;
  period: string;
  message: string;
}

const periodLabel = (period: string) => AI_LIMIT_PERIODS.find((item) => item.value === period)?.label ?? period;

export const UserLimitCell: FC<IUserLimitCellProps> = ({ userId, limit }) => {
  const { refresh } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, watch, handleSubmit, reset, formState } = useForm<FormValues>({
    defaultValues: {
      amount: limit ? String(limit.amount) : '',
      period: limit?.period ?? 'hour',
      message: limit?.message ?? '',
    },
  });

  // Пустое поле — лимита нет. Снятие делается тем же полем, что и установка:
  // стереть число и сохранить. Отдельной кнопки «снять» поэтому не нужно.
  const amountValue = watch('amount').trim();
  const hasLimit = amountValue !== '';

  const onSubmit = useCallback(
    async (data: FormValues) => {
      setIsSubmitting(true);
      try {
        await axios.put('/api/limits', {
          user_id: userId,
          amount: data.amount.trim() === '' ? null : Number(data.amount),
          period: data.period,
          message: data.message,
        });
        reset(data);
        refresh();
        toast.success(data.amount.trim() === '' ? 'Лимит снят' : 'Сохранено');
      } catch {
        toast.error('Ошибка сохранения');
      } finally {
        setIsSubmitting(false);
      }
    },
    [refresh, reset, userId],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={1}
          placeholder="—"
          className="w-20"
          aria-label="Сколько генераций"
          {...register('amount')}
        />

        {/* Период и личный отказ показываем, только когда лимит задан: пустая
            строка в таблице должна оставаться пустой строкой. */}
        {hasLimit && (
          <>
            <select
              className="border-input bg-background h-9 rounded-md border px-2 text-sm"
              aria-label="За какой срок"
              {...register('period')}
            >
              {AI_LIMIT_PERIODS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Свой текст отказа"
              onClick={() => setIsOpen((prev) => !prev)}
            >
              {isOpen ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </>
        )}

        {formState.isDirty && (
          <Button type="submit" size="sm" disabled={isSubmitting}>
            Сохранить
          </Button>
        )}
      </div>

      {hasLimit && isOpen && (
        <div className="flex flex-col gap-1">
          <Input placeholder="Свой текст отказа — пусто, значит общий" {...register('message')} />
        </div>
      )}

      {limit && (
        <span className="text-muted-foreground text-xs">
          Истрачено {limit.used} из {limit.amount} {periodLabel(limit.period)}
          {limit.message ? ' · свой текст отказа' : ''}
        </span>
      )}
    </form>
  );
};
