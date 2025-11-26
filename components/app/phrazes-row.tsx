'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';
import axios from 'axios';
import { CircleSlash, Pencil, Save, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Select from 'react-select';
import { toast } from 'sonner';
import { z } from 'zod';

import { PHRAZE_KEY_OPTIONS, REQUIRED_TEXT } from '@/lib/constants';
import { Prisma } from '@/lib/generated/prisma/client';
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
import { Form, FormField, FormItem, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { TableCell, TableRow } from '../ui/table';

interface IPhrazesRowProps {
  item: Prisma.phrazesModel;
}

const schema = z.object({
  key: z.object({
    label: z.string(),
    value: z.string(),
  }),
  value: z.string({ error: REQUIRED_TEXT }).min(1, { error: REQUIRED_TEXT }),
});

type PhrazeFormData = z.infer<typeof schema>;

export const PhrazesRow: FC<IPhrazesRowProps> = ({ item }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { refresh } = useRouter();

  const methods = useForm({
    defaultValues: {
      key: {
        label: item.key,
        value: item.key,
      },
      value: item.value,
    },
    resolver: zodResolver(schema),
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onUpdate: SubmitHandler<PhrazeFormData> = useCallback(
    async (data) => {
      try {
        await axios.put('/api/phrazes', {
          key: data.key.value,
          value: data.value,
          key_value: item,
        });
        refresh();
        setIsEditMode(false);
      } catch {
        toast.error('Ошибка сохранения');
      }
    },
    [item, refresh],
  );

  const onDelete = useCallback(async () => {
    try {
      await axios.delete('/api/phrazes', { data: { key: item.key, value: item.value } });
      toast.success('Запись успешно удалена');
      refresh();
    } catch {
      toast.error('Ошибка удаления записи');
    }
  }, [item.key, item.value, refresh]);

  return (
    <Form {...methods}>
      <TableRow>
        <TableCell>
          {isEditMode ? (
            <FormField
              control={control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <Select
                    {...field}
                    options={PHRAZE_KEY_OPTIONS}
                    unstyled
                    menuPosition="fixed"
                    classNames={getSelectClassNames()}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            item.key
          )}
        </TableCell>

        <TableCell>
          {isEditMode ? (
            <FormField
              control={control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            item.value
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
