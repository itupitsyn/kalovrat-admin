'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Select from 'react-select';
import { toast } from 'sonner';
import { z } from 'zod';

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
import { Checkbox } from '../ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '../ui/field';
import { Form, FormField, FormItem, FormMessage } from '../ui/form';

const FORM_ID = 'add-user-role-form';

interface IAddRoleFormProps {
  roles: Prisma.rolesModel[];
  chats: Prisma.chatsModel[];
  users: Prisma.usersModel[];
}

const schema = z.object({
  chat: z.object(
    {
      id: z.bigint(),
      name: z.string(),
      is_uncensored: z.boolean().nullable(),
    },
    { error: REQUIRED_TEXT },
  ),
  user: z.object(
    {
      id: z.bigint(),
      name: z.string(),
      alternative_name: z.string(),
    },
    { error: REQUIRED_TEXT },
  ),
  role: z
    .object(
      {
        id: z.bigint(),
        name: z.string().nullable(),
      },
      { error: REQUIRED_TEXT },
    )
    .nullable(),
  is_set_manually: z.boolean(),
});

type AddRoleFormData = z.infer<typeof schema>;

export const AddRoleForm: FC<IAddRoleFormProps> = ({ roles, chats, users }) => {
  const { refresh } = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      is_set_manually: false,
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit: SubmitHandler<AddRoleFormData> = useCallback(
    async (data) => {
      try {
        await axios.post('/api/roles', {
          chat_id: String(data.chat.id),
          user_id: String(data.user.id),
          role_id: data.role?.id != undefined ? String(data.role?.id) : data.role?.id,
          is_set_manually: data.is_set_manually,
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
              name="chat"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel htmlFor="chat">Чат</FieldLabel>
                  <Select<Prisma.chatsModel>
                    {...field}
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
                  <Select<Pick<Prisma.usersModel, 'id' | 'name' | 'alternative_name'>>
                    {...field}
                    id="user"
                    options={users}
                    unstyled
                    getOptionValue={(opt) => String(opt.id)}
                    getOptionLabel={getUserName}
                    classNames={getSelectClassNames()}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel htmlFor="role">Роль</FieldLabel>
                  <Select<Prisma.rolesModel>
                    {...field}
                    id="role"
                    options={roles}
                    unstyled
                    getOptionValue={(opt) => String(opt.id)}
                    getOptionLabel={(opt) => opt.name ?? ''}
                    classNames={getSelectClassNames()}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FieldGroup data-slot="checkbox-group">
              <FormField
                control={control}
                name="is_set_manually"
                render={({ field }) => (
                  <FormItem>
                    <Field orientation="horizontal">
                      <Checkbox
                        id="is-set-manually"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                      <FieldLabel htmlFor="is-set-manually">Установлен вручную</FieldLabel>
                    </Field>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FieldGroup>
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
