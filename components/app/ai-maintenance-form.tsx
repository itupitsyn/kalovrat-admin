'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { FC, useCallback } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useIsClient } from 'usehooks-ts';
import { z } from 'zod';

import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Field, FieldDescription, FieldLabel } from '../ui/field';
import { Form, FormField, FormItem, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';

interface IAiMaintenanceFormProps {
  isEnabled: boolean;
  endsAt: string | null;
}

const DATETIME_LOCAL_FORMAT = "yyyy-MM-dd'T'HH:mm";

const schema = z
  .object({
    is_enabled: z.boolean(),
    // Значение datetime-local: время браузера, без пояса. Пусто — срок не назван.
    ends_at: z.string(),
  })
  .refine((data) => !data.is_enabled || !data.ends_at || new Date(data.ends_at) > new Date(), {
    error: 'Это время уже прошло',
    path: ['ends_at'],
  });

type AiMaintenanceFormData = z.infer<typeof schema>;

const formatUtc = (date: Date) => `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC`;

const getStatusText = (isEnabled: boolean, endsAt: Date | null) => {
  if (!isEnabled) {
    return 'Выключена — нейронки работают';
  }
  if (!endsAt) {
    return 'Идёт, срок не назван — выключить можно только вручную';
  }
  if (endsAt <= new Date()) {
    return `Закончилась ${format(endsAt, 'dd.MM.yyyy HH:mm')} — нейронки работают`;
  }
  return `Идёт до ${format(endsAt, 'dd.MM.yyyy HH:mm')} (${formatUtc(endsAt)})`;
};

export const AiMaintenanceForm: FC<IAiMaintenanceFormProps> = (props) => {
  // Время показываем в поясе браузера, а сервер его не знает: рисуем форму
  // только на клиенте, чтобы не разъехаться при гидрации.
  const isClient = useIsClient();

  if (!isClient) {
    return <Skeleton className="h-72 max-w-xl" />;
  }

  return <AiMaintenanceFormContent {...props} />;
};

const AiMaintenanceFormContent: FC<IAiMaintenanceFormProps> = ({ isEnabled, endsAt }) => {
  const { refresh } = useRouter();
  const savedEndsAt = endsAt ? new Date(endsAt) : null;

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      is_enabled: isEnabled,
      ends_at: savedEndsAt ? format(savedEndsAt, DATETIME_LOCAL_FORMAT) : '',
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = methods;

  const endsAtValue = watch('ends_at');

  const onSubmit: SubmitHandler<AiMaintenanceFormData> = useCallback(
    async (data) => {
      try {
        await axios.put('/api/maintenance', {
          is_enabled: data.is_enabled,
          ends_at: data.ends_at ? new Date(data.ends_at).toISOString() : null,
        });
        reset(data);
        refresh();
        toast.success('Сохранено');
      } catch {
        toast.error('Ошибка сохранения');
      }
    },
    [refresh, reset],
  );

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Профилактика</CardTitle>
        <CardDescription>{getStatusText(isEnabled, savedEndsAt)}</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
            <FormField
              control={control}
              name="is_enabled"
              render={({ field }) => (
                <FormItem>
                  <Field orientation="horizontal">
                    <Checkbox
                      id="is-enabled"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                      onBlur={field.onBlur}
                    />
                    <FieldLabel htmlFor="is-enabled">Включить профилактику</FieldLabel>
                  </Field>
                  <FieldDescription>
                    Пока идёт, бот не рисует, не анимирует, не расшифровывает и не пересказывает, а отвечает, что
                    нейронки на профилактике.
                  </FieldDescription>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="ends_at"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel htmlFor="ends-at">Вернёмся</FieldLabel>
                  <div className="flex gap-2">
                    <Input id="ends-at" type="datetime-local" className="w-auto" {...field} />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setValue('ends_at', '', { shouldDirty: true, shouldValidate: true })}
                      disabled={!endsAtValue}
                    >
                      Без срока
                    </Button>
                  </div>
                  <FieldDescription>
                    {endsAtValue
                      ? `Время вашего браузера. Бот назовёт его по UTC: ${formatUtc(new Date(endsAtValue))}. В это время профилактика закончится сама.`
                      : 'Срок не назван: бот скажет «скоро вернёмся», выключить профилактику нужно будет вручную.'}
                  </FieldDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Button type="submit" disabled={isSubmitting}>
                Сохранить
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
