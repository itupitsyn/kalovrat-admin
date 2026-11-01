import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getModeration, setModerationAll, setModerationUser } from '@/lib/ai-api';

/**
 * Либо общий выключатель, либо один человек. Списком целиком барьер не
 * пишется нарочно — см. setModerationUser.
 */
const schema = z.union([
  z.object({ all: z.boolean() }),
  z.object({ user_id: z.string().regex(/^-?\d+$/), enabled: z.boolean() }),
]);

export const GET = async () => {
  try {
    return NextResponse.json(await getModeration());
  } catch (e) {
    console.error(e);
    return new NextResponse('', { status: 502 });
  }
};

export const PUT = async (req: NextRequest) => {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return new NextResponse('', { status: 422 });
    }

    const state =
      'all' in parsed.data
        ? await setModerationAll(parsed.data.all)
        : await setModerationUser(parsed.data.user_id, parsed.data.enabled);

    // Отдаём состояние целиком: истина — файл сервиса, а не то, что нарисовано
    // в браузере, и клиенту незачем угадывать результат своего же щелчка.
    return NextResponse.json(state);
  } catch (e) {
    // 502, а не 500: виноват не этот запрос, а недоступный сервис генерации, и
    // по коду это должно быть видно — иначе причину будут искать в админке.
    console.error(e);
    return new NextResponse('', { status: 502 });
  }
};
