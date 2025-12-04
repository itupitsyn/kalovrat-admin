'use client';

import { zodResolver } from '@hookform/resolvers/zod';
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
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '../ui/field';
import { Form, FormField, FormItem, FormMessage } from '../ui/form';
import { Input } from '../ui/input';

const FORM_ID = 'add-phraze-form';

const schema = z.object({
  key: z.object({
    label: z.string(),
    value: z.string(),
  }),
  value: z.string({ error: REQUIRED_TEXT }).min(1, { error: REQUIRED_TEXT }),
  is_uncensored: z.boolean().nullable(),
  is_with_spoiler: z.boolean().nullable(),
  group: z.any().transform((value, ctx) => {
    if (!value) {
      return null;
    }

    try {
      return BigInt(value);
    } catch {
      ctx.addIssue({
        code: 'invalid_type',
        expected: 'unknown',
        received: value,
        message: `Can't be parsed to BigInt`,
      });
    }
  }),

  order: z.any().transform((value, ctx) => {
    if (!value) {
      return null;
    }

    try {
      return BigInt(value);
    } catch {
      ctx.addIssue({
        code: 'invalid_type',
        expected: 'unknown',
        received: value,
        message: `Can't be parsed to BigInt`,
      });
    }
  }),
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
      is_uncensored: false,
      is_with_spoiler: false,
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
          group: data.group != undefined ? String(data.group) : null,
          order: data.order != undefined ? String(data.order) : null,
          is_with_spoiler: data.is_with_spoiler,
          is_uncensored: data.is_uncensored,
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

            <FieldGroup data-slot="checkbox-group">
              <FormField
                control={control}
                name="is_uncensored"
                render={({ field }) => (
                  <FormItem data-slot="checkbox-group">
                    <Field orientation="horizontal">
                      <Checkbox
                        id="is-uncensored"
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                      <FieldLabel htmlFor="is-uncensored">Без цензуры</FieldLabel>
                    </Field>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FieldGroup>

            <FieldGroup data-slot="checkbox-group">
              <FormField
                control={control}
                name="is_with_spoiler"
                render={({ field }) => (
                  <FormItem>
                    <Field orientation="horizontal">
                      <Checkbox
                        id="is-with-spoiler"
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                      <FieldLabel htmlFor="is-with-spoiler">Спойлер</FieldLabel>
                    </Field>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FieldGroup>

            <FormField
              control={control}
              name="group"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel htmlFor="group">Группа</FieldLabel>
                  <Input
                    type="number"
                    id="group"
                    {...field}
                    value={field.value != undefined ? String(field.value) : ''}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FieldLabel htmlFor="order">Порядок</FieldLabel>
                  <Input
                    type="number"
                    id="order"
                    {...field}
                    value={field.value != undefined ? String(field.value) : ''}
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
