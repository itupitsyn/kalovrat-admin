import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../lib/generated/prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  // adapter-pg sends dates as UTC wall time without an offset and drops the
  // offset when reading timestamptz back. Postgres fills the gap with the
  // session time zone, so anything but UTC here shifts every saved time.
  options: '-c TimeZone=UTC',
});

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
