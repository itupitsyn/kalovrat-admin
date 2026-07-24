'use client';

import axios from 'axios';
import { ChevronDown, ChevronUp, CircleSlash, Pencil, Plus, Save, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import Select from 'react-select';
import { toast } from 'sonner';

import { PHRAZE_KEY_OPTIONS } from '@/lib/constants';
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
import { Input } from '../ui/input';
import { TableCell, TableRow } from '../ui/table';

export interface SerializablePhraze {
  key: string;
  value: string;
  is_uncensored: boolean | null;
  is_with_spoiler: boolean | null;
  group: string | null;
  order: string | null;
}

interface IPhrazeRowProps {
  /** Исходный ключ строки (часть первичного ключа фраз). */
  groupKey: string;
  /** Исходная группа: null — отдельная фраза без группы. */
  group: string | null;
  /** Фразы строки: одна для безгрупповой, несколько для группы (уже отсортированы по порядку). */
  phrazes: SerializablePhraze[];
}

interface PhrazeField {
  /** Значение фразы на момент загрузки (часть первичного ключа). null — новая, ещё не сохранённая фраза. */
  originalValue: string | null;
  value: string;
  is_uncensored: boolean;
  is_with_spoiler: boolean;
}

interface FormValues {
  key: { label: string; value: string };
  group: string;
  items: PhrazeField[];
}

const buildDefaultValues = (groupKey: string, group: string | null, phrazes: SerializablePhraze[]): FormValues => ({
  key: { label: groupKey, value: groupKey },
  group: group ?? '',
  items: phrazes.map((item) => ({
    originalValue: item.value,
    value: item.value,
    is_uncensored: !!item.is_uncensored,
    is_with_spoiler: !!item.is_with_spoiler,
  })),
});

export const PhrazeRow: FC<IPhrazeRowProps> = ({ groupKey, group, phrazes }) => {
  const { refresh } = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleted, setDeleted] = useState<string[]>([]);

  const { control, register, watch, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: buildDefaultValues(groupKey, group, phrazes),
  });

  const { fields, append, remove, move } = useFieldArray({ control, name: 'items' });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const groupValue = watch('group');
  const isGrouped = groupValue != null && String(groupValue).trim() !== '';

  const stopEditing = useCallback(() => {
    reset(buildDefaultValues(groupKey, group, phrazes));
    setDeleted([]);
    setIsEditMode(false);
  }, [group, groupKey, phrazes, reset]);

  const onRemove = useCallback(
    (index: number) => {
      const original = fields[index]?.originalValue;
      if (original != null) {
        setDeleted((prev) => [...prev, original]);
      }
      remove(index);
    },
    [fields, remove],
  );

  const onSubmit = useCallback(
    async (values: FormValues) => {
      if (values.items.length === 0) {
        toast.error('Нужна хотя бы одна фраза');
        return;
      }

      if (values.items.some((item) => !item.value.trim())) {
        toast.error('Фраза не может быть пустой');
        return;
      }

      const key = values.key.value;
      const nextGroup = values.group.trim() ? values.group.trim() : null;

      setIsSubmitting(true);
      try {
        for (const value of deleted) {
          await axios.delete('/api/phrazes', { data: { key: groupKey, value } });
        }

        for (let index = 0; index < values.items.length; index++) {
          const item = values.items[index];
          const payload = {
            key,
            value: item.value.trim(),
            group: nextGroup,
            // У группы порядок — позиция в списке; у безгрупповой фразы порядок не используется.
            order: nextGroup != null ? String(index) : null,
            is_uncensored: item.is_uncensored,
            is_with_spoiler: item.is_with_spoiler,
          };

          if (item.originalValue == null) {
            await axios.post('/api/phrazes', payload);
          } else {
            await axios.put('/api/phrazes', {
              ...payload,
              key_value: { key: groupKey, value: item.originalValue },
            });
          }
        }

        toast.success('Сохранено');
        setDeleted([]);
        setIsEditMode(false);
        refresh();
      } catch {
        toast.error('Ошибка сохранения');
      } finally {
        setIsSubmitting(false);
      }
    },
    [deleted, groupKey, refresh],
  );

  const onDeleteRow = useCallback(async () => {
    try {
      for (const item of phrazes) {
        await axios.delete('/api/phrazes', { data: { key: groupKey, value: item.value } });
      }
      toast.success(group != null ? 'Группа удалена' : 'Запись удалена');
      refresh();
    } catch {
      toast.error('Ошибка удаления');
    }
  }, [group, groupKey, phrazes, refresh]);

  return (
    <TableRow className={group != null ? 'bg-muted/30' : undefined}>
      {/* Ключ */}
      <TableCell className="align-top">
        {isEditMode ? (
          <Controller
            control={control}
            name="key"
            render={({ field }) => (
              <Select
                {...field}
                options={PHRAZE_KEY_OPTIONS}
                unstyled
                menuPosition="fixed"
                classNames={getSelectClassNames()}
              />
            )}
          />
        ) : (
          groupKey
        )}
      </TableCell>

      {/* Фраза(ы) */}
      <TableCell className="max-w-lg align-top whitespace-break-spaces">
        {isEditMode ? (
          isGrouped ? (
            <div className="flex flex-col gap-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex min-h-9 items-center gap-2">
                  <div className="flex flex-col">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      className="h-4"
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                      title="Выше"
                    >
                      <ChevronUp />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      className="h-4"
                      disabled={index === fields.length - 1}
                      onClick={() => move(index, index + 1)}
                      title="Ниже"
                    >
                      <ChevronDown />
                    </Button>
                  </div>

                  <Input className="flex-1" {...register(`items.${index}.value`)} />
                </div>
              ))}

              <div className="flex min-h-9 items-center">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    append({ originalValue: null, value: '', is_uncensored: false, is_with_spoiler: false })
                  }
                >
                  <Plus />
                  Добавить фразу
                </Button>
              </div>
            </div>
          ) : (
            <Input {...register('items.0.value')} />
          )
        ) : group != null ? (
          <div className="flex flex-col gap-2">
            {phrazes.map((item, index) => (
              <div key={item.value} className="flex min-h-8 items-center gap-2">
                <span className="text-muted-foreground w-5 shrink-0 text-right tabular-nums">{index + 1}.</span>
                <span className="whitespace-break-spaces">{item.value}</span>
              </div>
            ))}
          </div>
        ) : (
          phrazes[0]?.value
        )}
      </TableCell>

      {/* Без цензуры */}
      <TableCell className="text-center align-top">
        {isEditMode ? (
          isGrouped ? (
            <div className="flex flex-col gap-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex min-h-9 items-center justify-center">
                  <Controller
                    control={control}
                    name={`items.${index}.is_uncensored`}
                    render={({ field: checkboxField }) => (
                      <Checkbox
                        checked={checkboxField.value}
                        onCheckedChange={(checked) => checkboxField.onChange(checked === true)}
                      />
                    )}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Controller
              control={control}
              name="items.0.is_uncensored"
              render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
              )}
            />
          )
        ) : group != null ? (
          <div className="flex flex-col gap-2">
            {phrazes.map((item) => (
              <div key={item.value} className="flex min-h-8 items-center justify-center">
                <Checkbox checked={!!item.is_uncensored} />
              </div>
            ))}
          </div>
        ) : (
          <Checkbox checked={!!phrazes[0]?.is_uncensored} />
        )}
      </TableCell>

      {/* Спойлер */}
      <TableCell className="text-center align-top">
        {isEditMode ? (
          isGrouped ? (
            <div className="flex flex-col gap-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex min-h-9 items-center justify-center">
                  <Controller
                    control={control}
                    name={`items.${index}.is_with_spoiler`}
                    render={({ field: checkboxField }) => (
                      <Checkbox
                        checked={checkboxField.value}
                        onCheckedChange={(checked) => checkboxField.onChange(checked === true)}
                      />
                    )}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Controller
              control={control}
              name="items.0.is_with_spoiler"
              render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
              )}
            />
          )
        ) : group != null ? (
          <div className="flex flex-col gap-2">
            {phrazes.map((item) => (
              <div key={item.value} className="flex min-h-8 items-center justify-center">
                <Checkbox checked={!!item.is_with_spoiler} />
              </div>
            ))}
          </div>
        ) : (
          <Checkbox checked={!!phrazes[0]?.is_with_spoiler} />
        )}
      </TableCell>

      {/* Группа */}
      <TableCell className="align-top">
        {isEditMode ? <Input type="number" className="w-20" {...register('group')} /> : group}
      </TableCell>

      {/* Действия */}
      <TableCell className="align-top">
        {isEditMode ? (
          isGrouped ? (
            <div className="flex flex-col gap-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex min-h-9 items-center">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="destructive"
                    onClick={() => onRemove(index)}
                    title="Удалить фразу"
                  >
                    <Trash />
                  </Button>
                </div>
              ))}

              <div className="flex min-h-9 items-center gap-2">
                <Button size="icon-sm" variant="outline" onClick={stopEditing} title="Отмена">
                  <CircleSlash />
                </Button>
                <Button size="icon-sm" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} title="Сохранить">
                  <Save />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              <Button size="icon-sm" variant="outline" onClick={stopEditing} title="Отмена">
                <CircleSlash />
              </Button>
              <Button size="icon-sm" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} title="Сохранить">
                <Save />
              </Button>
            </div>
          )
        ) : (
          <div className="flex gap-4">
            <Button variant="outline" size="icon-sm" onClick={() => setIsEditMode(true)} title="Редактировать">
              <Pencil />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon-sm" title={group != null ? 'Удалить группу' : 'Удалить'}>
                  <Trash />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{group != null ? 'Удалить всю группу?' : 'Удалить запись?'}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {group != null
                      ? 'Будут удалены все фразы этой группы. Это действие нельзя отменить.'
                      : 'Это действие нельзя отменить'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction onClick={onDeleteRow}>Удалить</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};
