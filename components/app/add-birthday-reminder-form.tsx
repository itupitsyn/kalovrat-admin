'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Select from 'react-select';
import { toast } from 'sonner';
import { z } from 'zod';

import { formatBirthday } from '@/lib/birthday';
import { REQUIRED_TEXT } from '@/lib/constants';
import { Prisma } from '@/lib/generated/prisma/client';
import { getSelectClassNames, getUserName } from '@/lib/utils';

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
import { FieldLabel } from '../ui/field';
import { Form, FormField, FormItem, FormMessage } from '../ui/form';

const FORM_ID = 'add-birthday-reminder-form';

interface IAddBirthdayReminderFormProps {
  chats: Prisma.chatsModel[];
  users: Prisma.usersModel[];
}

const schema = z.object({
  chat: z.object({ id: z.bigint(), name: z.string() }, { error: REQUIRED_TEXT }),
  user: z.object({ id: z.bigint() }, { error: REQUIRED_TEXT }),
});

type AddBirthdayReminderFormData = z.infer<typeof schema>;

export const AddBirthdayReminderForm: FC<IAddBirthdayReminderFormProps> = ({ chats, users }) => {
  const { refresh } = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const methods = useForm({ resolver: zodResolver(schema) });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit: SubmitHandler<AddBirthdayReminderFormData> = useCallback(
    async (data) => {
      try {
        await axios.post('/api/birthdays', {
          chat_id: String(data.chat.id),
          user_id: String(data.user.id),
        });
        reset();
        refresh();
        setIsOpen(false);
      } catch (e) {
        toast.error(
          axios.isAxiosError(e) && e.response?.status === 409
            ? 'У этого пользователя не задан день рождения. Задайте его в разделе «Пользователи»'
            : 'Ошибка сохранения',
        );
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
          <AlertDialogTitle>Напоминать о дне рождения</AlertDialogTitle>
          <AlertDialogDescription></AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate id={FORM_ID} className="flex flex-col gap-4">
            <FormField
              control={control}
              name="chat"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel htmlFor="chat">Чат</FieldLabel>
                  <Select<Prisma.chatsModel>
                    {...field}
                    value={field.value as Prisma.chatsModel | undefined}
                    id="chat"
                    options={chats}
                    unstyled
                    getOptionValue={(opt) => String(opt.id)}
                    getOptionLabel={(opt) => opt.name ?? ''}
                    classNames={getSelectClassNames()}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel htmlFor="user">Пользователь</FieldLabel>
                  <Select<Prisma.usersModel>
                    {...field}
                    value={field.value as Prisma.usersModel | undefined}
                    id="user"
                    options={users}
                    unstyled
                    getOptionValue={(opt) => String(opt.id)}
                    getOptionLabel={(opt) =>
                      `${getUserName(opt)} — ${formatBirthday(opt.birthday) || 'дата не задана'}`
                    }
                    classNames={getSelectClassNames()}
                  />
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
