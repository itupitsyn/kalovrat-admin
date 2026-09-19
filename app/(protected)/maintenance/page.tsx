import { AiMaintenanceForm } from '@/components/app/ai-maintenance-form';
import { TableWrapper } from '@/components/app/table-wrapper';
import { AI_MAINTENANCE_ID } from '@/lib/constants';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const maintenance = await prisma.ai_maintenances.findUnique({ where: { id: AI_MAINTENANCE_ID } });

  return (
    <TableWrapper title="Профилактика AI">
      <AiMaintenanceForm
        isEnabled={!!maintenance?.is_enabled}
        endsAt={maintenance?.ends_at ? maintenance.ends_at.toISOString() : null}
      />
    </TableWrapper>
  );
}
