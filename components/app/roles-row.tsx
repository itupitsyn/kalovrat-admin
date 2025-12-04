'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { CircleSlash, Pencil, Save, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Select from 'react-select';
import { toast } from 'sonner';
import { z } from 'zod';

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
import { Form, FormField, FormItem, FormMessage } from '../ui/form';
import { TableCell, TableRow } from '../ui/table';

interface IRolesRowProps {
  item: {
    chats: Prisma.chatsModel;
    users: Prisma.usersModel;
    roles: Prisma.rolesModel | null;
    is_set_manually: boolean | null;
  };
  roles: Prisma.rolesModel[];
}

const schema = z.object({
  chat_id: z.bigint(),
  user_id: z.bigint(),
  role: z
    .object({
      id: z.bigint(),
      name: z.string().nullable(),
    })
    .nullable(),
  is_set_manually: z.boolean(),
});

type RoleFormData = z.infer<typeof schema>;

export const RolesRow: FC<IRolesRowProps> = ({ item, roles }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { refresh } = useRouter();

  const methods = useForm({
    defaultValues: {
      chat_id: item.chats.id,
      user_id: item.users.id,
      role: item.roles,
      is_set_manually: !!item.is_set_manually,
    },
    resolver: zodResolver(schema),
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onUpdate: SubmitHandler<RoleFormData> = useCallback(
    async (data) => {
      try {
        await axios.put('/api/roles', {
          chat_id: String(data.chat_id),
          user_id: String(data.user_id),
          role_id: data.role?.id != undefined ? String(data.role?.id) : data.role?.id,
          is_set_manually: data.is_set_manually,
        });
        refresh();
        setIsEditMode(false);
      } catch {
        toast.error('Ошибка сохранения');
      }
    },
    [refresh],
  );

  const onDelete = useCallback(async () => {
    try {
      await axios.delete('/api/roles', { data: { chat_id: String(item.chats.id), user_id: String(item.users.id) } });
      toast.success('Запись успешно удалена');
      refresh();
    } catch {
      toast.error('Ошибка удаления записи');
    }
  }, [item.chats.id, item.users.id, refresh]);

  return (
    <Form {...methods}>
      <TableRow>
        <TableCell>{item.chats.name}</TableCell>

        <TableCell>{getUserName(item.users)}</TableCell>

        <TableCell>
          {isEditMode ? (
            <FormField
              control={control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <Select<Prisma.rolesModel>
                    {...field}
                    options={roles}
                    unstyled
                    menuPosition="fixed"
                    getOptionValue={(opt) => String(opt.id)}
                    getOptionLabel={(opt) => opt.name ?? ''}
                    classNames={getSelectClassNames()}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            item.roles?.name
          )}
        </TableCell>

        <TableCell className="text-center">
          {isEditMode ? (
            <FormField
              control={control}
              name="is_set_manually"
              render={({ field }) => (
                <FormItem>
                  <div>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} onBlur={field.onBlur} />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <Checkbox checked={!!item.is_set_manually} />
          )}
        </TableCell>

        <TableCell className="flex gap-4">
          {isEditMode ? (
            <>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => {
                  setIsEditMode(false);
                }}
              >
                <CircleSlash />
              </Button>
              <Button size="icon-sm" onClick={handleSubmit(onUpdate)} disabled={isSubmitting}>
                <Save />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => {
                  setIsEditMode(true);
                }}
              >
                <Pencil />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon-sm">
                    <Trash />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Удалить запись?</AlertDialogTitle>
                    <AlertDialogDescription>Это действие нельзя отменить</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete}>Удалить</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </TableCell>
      </TableRow>
    </Form>
  );
};
