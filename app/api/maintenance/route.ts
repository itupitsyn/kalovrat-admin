import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { AI_MAINTENANCE_ID } from '@/lib/constants';
import prisma from '@/lib/prisma';

const schema = z.object({
  is_enabled: z.boolean(),
  ends_at: z.iso.datetime().nullable(),
});

export const PUT = async (req: NextRequest) => {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return new NextResponse('', { status: 422 });
    }

    const data = {
      is_enabled: parsed.data.is_enabled,
      ends_at: parsed.data.ends_at ? new Date(parsed.data.ends_at) : null,
      updated_at: new Date(),
    };

    await prisma.ai_maintenances.upsert({
      create: { id: AI_MAINTENANCE_ID, ...data },
      update: data,
      where: { id: AI_MAINTENANCE_ID },
    });
  } catch (e) {
    console.error(e);
    return new NextResponse('', { status: 500 });
  }
  return new NextResponse();
};
