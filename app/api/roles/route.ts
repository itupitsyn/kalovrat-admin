import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export const PUT = async (req: NextRequest) => {
  try {
    const body = await req.json();
    await prisma.chat_user_roles.update({
      data: {
        is_set_manually: body.is_set_manually,
        role_id: body.role_id,
      },
      where: {
        user_id_chat_id: { chat_id: body.chat_id, user_id: body.user_id },
      },
    });
  } catch {
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

    await prisma.chat_user_roles.delete({
      where: {
        user_id_chat_id: { chat_id: body.chat_id, user_id: body.user_id },
      },
    });
  } catch {
    return new NextResponse('', { status: 500 });
  }
  return new NextResponse();
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    await prisma.chat_user_roles.create({
      data: {
        is_set_manually: body.is_set_manually,
        role_id: body.role_id,
        chat_id: body.chat_id,
        user_id: body.user_id,
      },
    });
  } catch {
    return new NextResponse('', { status: 500 });
  }
  return new NextResponse();
};
