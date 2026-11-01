'use client';

import axios from 'axios';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useCallback, useState } from 'react';
import { toast } from 'sonner';

import { ModerationState } from '@/lib/ai-api';

import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Field, FieldDescription, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';

interface IAiModerationFormProps {
  /** Состояние с сервиса. null — сервис не ответил. */
  state: ModerationState | null;
  /** Почему не ответил: показываем причину, а не пустую страницу. */
  error: string | null;
  /** id -> как звать, для тех, кто нашёлся в базе бота. */
  names: Record<string, string>;
}

export const AiModerationForm: FC<IAiModerationFormProps> = ({ state, error, names }) => {
  const { refresh } = useRouter();
  const [isBusy, setIsBusy] = useState(false);
  const [newId, setNewId] = useState('');

  const send = useCallback(
    async (body: Record<string, unknown>, done: string) => {
      try {
        setIsBusy(true);
        await axios.put('/api/moderation', body);
        refresh();
        toast.success(done);
        return true;
      } catch {
        toast.error('Сервис генерации не ответил — состояние не изменилось');
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [refresh],
  );

  const addUser = useCallback(async () => {
    const id = newId.trim();
    if (!/^-?\d+$/.test(id)) {
      toast.error('id — это число');
      return;
    }
    if (await send({ user_id: id, enabled: true }, 'Барьер включён')) {
      setNewId('');
    }
  }, [newId, send]);

  if (!state) {
    return (
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Барьер недоступен</CardTitle>
          <CardDescription>
            Состояние живёт в сервисе генерации, и он не ответил: {error}. Проверьте, что у админки заданы AI_API_URL и
            AI_API_TOKEN и что сервис поднят. Сам барьер при этом работает как работал — админка только показывает и
            переключает.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Общая цензура</CardTitle>
          <CardDescription>{state.state}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Field orientation="horizontal">
            <Checkbox
              id="moderation-all"
              checked={state.all || state.forced}
              disabled={isBusy || state.forced}
              onCheckedChange={(checked) => send({ all: checked === true }, 'Сохранено')}
            />
            <FieldLabel htmlFor="moderation-all">Проверять всех</FieldLabel>
          </Field>

          <FieldDescription>
            {state.forced
              ? 'Барьер включён принудительно переменной MODERATION_ENABLED в окружении сервиса. Отсюда её не снять: нужно убрать строку и пересоздать контейнер. Пока она стоит, выключатели ниже ничего не решают.'
              : 'Включено — каждый запрос, включая присланные фотографии и кадры видео, проходит через модель барьера. Выключено — проверяются только те, кто перечислен ниже. Действует сразу, рестарт сервису не нужен.'}
          </FieldDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Поимённо</CardTitle>
          <CardDescription>
            {state.users.length
              ? `Под барьером ${state.users.length}`
              : 'Пока никого: при снятой общей цензуре проверок нет ни у кого'}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {!!state.users.length && (
            <ul className="flex flex-col gap-2">
              {state.users.map((id) => (
                <li key={id} className="flex items-center gap-2">
                  <span className="font-mono">{id}</span>
                  <span className="text-muted-foreground grow truncate">{names[String(id)] ?? ''}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Снять барьер"
                    disabled={isBusy}
                    onClick={() => send({ user_id: String(id), enabled: false }, 'Барьер снят')}
                  >
                    <X />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <Field orientation="horizontal">
            <Input
              id="moderation-new-id"
              className="w-auto font-mono"
              placeholder="123456789"
              inputMode="numeric"
              value={newId}
              onChange={(event) => setNewId(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addUser();
                }
              }}
            />
            <Button type="button" onClick={addUser} disabled={isBusy || !newId.trim()}>
              Добавить
            </Button>
          </Field>

          <FieldDescription>
            Тот же выключатель есть в таблице пользователей — там видно, кого добавляешь. Здесь удобно, когда id
            известен, а человека в таблице ещё нет.
          </FieldDescription>
        </CardContent>
      </Card>
    </div>
  );
};
