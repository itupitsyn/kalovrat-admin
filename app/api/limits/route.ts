import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { AI_LIMIT_PERIODS, AI_LIMIT_SETTINGS_ID } from '@/lib/constants';
import prisma from '@/lib/prisma';

const periods = AI_LIMIT_PERIODS.map((item) => item.value);

const schema = z.object({
  user_id: z.string().regex(/^-?\d+$/),
  // Пусто — лимита нет, и строка удаляется. Так снятие лимита делается тем же
  // полем, что и установка: стереть число и сохранить.
  amount: z.number().int().min(1).nullable(),
  period: z.enum(periods as [string, ...string[]]),
  message: z.string(),
});

export const PUT = async (req: NextRequest) => {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return new NextResponse('', { status: 422 });
    }

    const user_id = BigInt(parsed.data.user_id);

    if (parsed.data.amount === null) {
      // deleteMany, а не delete: строки может и не быть, и это нормальный ход
      // событий — человеку просто никогда не ставили лимит.
      await prisma.ai_limits.deleteMany({ where: { user_id } });
      return new NextResponse();
    }

    const data = {
      amount: parsed.data.amount,
      period: parsed.data.period,
      message: parsed.data.message,
      updated_at: new Date(),
    };

    await prisma.ai_limits.upsert({
      create: { user_id, created_at: new Date(), ...data },
      update: data,
      where: { user_id },
    });
  } catch (e) {
    console.error(e);
    return new NextResponse('', { status: 500 });
  }
  return new NextResponse();
};

const settingsSchema = z.object({ message: z.string() });

// POST, а не второй PUT: общая формулировка — отдельная настройка, и валить её
// в один обработчик с персональными лимитами значило бы разбирать в теле, что
// именно пришло.
export const POST = async (req: NextRequest) => {
  try {
    const parsed = settingsSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new NextResponse('', { status: 422 });
    }

    const data = { message: parsed.data.message, updated_at: new Date() };

    await prisma.ai_limit_settings.upsert({
      create: { id: AI_LIMIT_SETTINGS_ID, ...data },
      update: data,
      where: { id: AI_LIMIT_SETTINGS_ID },
    });
  } catch (e) {
    console.error(e);
    return new NextResponse('', { status: 500 });
  }
  return new NextResponse();
};
