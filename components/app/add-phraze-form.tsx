'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Select from 'react-select';
import { toast } from 'sonner';
import { z } from 'zod';

import { PHRAZE_KEY_OPTIONS, REQUIRED_TEXT } from '@/lib/constants';
import { getSelectClassNames } from '@/lib/utils';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { FieldLabel } from '../ui/field';
import { Form, FormField, FormItem, FormMessage } from '../ui/form';
import { Input } from '../ui/input';

const FORM_ID = 'add-phraze-form';

const schema = z.object({
  key: z.object({
    label: z.string(),
    value: z.string(),
  }),
  value: z.string({ error: REQUIRED_TEXT }).min(1, { error: REQUIRED_TEXT }),
});

type AddPhrazeFormData = z.infer<typeof schema>;

export const AddPhrazeForm: FC = () => {
  const { refresh } = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      value: '',
      key: PHRAZE_KEY_OPTIONS[0],
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit: SubmitHandler<AddPhrazeFormData> = useCallback(
    async (data) => {
      try {
        await axios.post('/api/phrazes', {
          key: data.key.value,
          value: data.value,
        });
        reset();
        refresh();
        setIsOpen(false);
      } catch {
        toast.error('Ошибка сохранения');
      }
    },
    [refresh, reset],
  );

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogTrigger asChild>
        <Button
          onClick={() => {
            setIsOpen(true);
          }}
        >
          Добавить
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Добавить роль</AlertDialogTitle>
          <AlertDialogDescription></AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate id={FORM_ID} className="flex flex-col gap-4">
            <FormField
              control={control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel htmlFor="chat">Ключ</FieldLabel>
                  <Select {...field} options={PHRAZE_KEY_OPTIONS} unstyled classNames={getSelectClassNames()} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel htmlFor="user">Фраза</FieldLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction form={FORM_ID} type="submit" disabled={isSubmitting}>
            Сохранить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
