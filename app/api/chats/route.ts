import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export const PUT = async (req: NextRequest) => {
  try {
    const body = await req.json();
    await prisma.chats.update({
      data: {
        // Каждая ячейка шлёт только своё поле: undefined prisma не трогает.
        is_uncensored: body.is_uncensored,
        birthdays_enabled: body.birthdays_enabled,
      },
      where: {
        id: body.chat_id,
      },
    });
  } catch (e) {
    console.error(e);
    return new NextResponse('', { status: 500 });
  }
  return new NextResponse();
};
