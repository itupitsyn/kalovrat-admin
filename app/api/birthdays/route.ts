import { NextRequest, NextResponse } from 'next/server';

import { parseBirthday } from '@/lib/birthday';
import prisma from '@/lib/prisma';

// PUT — дата человека: пустая строка её стирает. Хранится у человека и одна на
// все чаты; кому напоминать, решают POST и DELETE ниже.
export const PUT = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const text = String(body.birthday ?? '').trim();
    const birthday = text === '' ? null : parseBirthday(text);
    if (!body.user_id || (text !== '' && !birthday)) {
      return new NextResponse('', { status: 422 });
    }

    await prisma.users.update({ data: { birthday }, where: { id: body.user_id } });
  } catch (e) {
    console.error(e);
    return new NextResponse('', { status: 500 });
  }
  return new NextResponse();
};

// Без даты напоминать не о чем: об этом надо сказать сейчас, а не молчать в тот
// день, когда никто не поздравит. Форма показывает отказ по коду 409.
export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    if (!body.chat_id || !body.user_id) {
      return new NextResponse('', { status: 422 });
    }

    const user = await prisma.users.findUnique({ where: { id: body.user_id }, select: { birthday: true } });
    if (!user?.birthday) {
      return new NextResponse('', { status: 409 });
    }

    const key = { chat_id: body.chat_id, user_id: body.user_id };
    await prisma.birthday_reminders.upsert({ create: key, update: {}, where: { chat_id_user_id: key } });
  } catch (e) {
    console.error(e);
    return new NextResponse('', { status: 500 });
  }
  return new NextResponse();
};

export const DELETE = async (req: NextRequest) => {
  try {
    const body = await req.json();
    if (!body.chat_id || !body.user_id) {
      return new NextResponse('', { status: 422 });
    }

    await prisma.birthday_reminders.delete({
      where: { chat_id_user_id: { chat_id: body.chat_id, user_id: body.user_id } },
    });
  } catch (e) {
    console.error(e);
    return new NextResponse('', { status: 500 });
  }
  return new NextResponse();
};
