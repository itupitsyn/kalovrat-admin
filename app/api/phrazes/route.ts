import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export const PUT = async (req: NextRequest) => {
  try {
    const body = await req.json();

    if (!body.key_value?.key || !body.key_value?.value) {
      return new NextResponse('', { status: 422 });
    }

    await prisma.phrazes.update({
      data: {
        key: body.key,
        value: body.value,
      },
      where: {
        key_value: body.key_value,
      },
    });
  } catch (e) {
    console.error(e);
    return new NextResponse('', { status: 500 });
  }
  return new NextResponse();
};

export const DELETE = async (req: NextRequest) => {
  try {
    const body = await req.json();
    if (!body.key || !body.value) {
      return new NextResponse('', { status: 422 });
    }

    await prisma.phrazes.delete({
      where: {
        key_value: body,
      },
    });
  } catch (e) {
    console.error(e);
    return new NextResponse('', { status: 500 });
  }
  return new NextResponse();
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    await prisma.phrazes.create({
      data: {
        key: body.key,
        value: body.value,
      },
    });
  } catch (e) {
    console.error(e);
    return new NextResponse('', { status: 500 });
  }
  return new NextResponse();
};
