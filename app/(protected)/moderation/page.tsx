import { AiModerationForm } from '@/components/app/ai-moderation-form';
import { TableWrapper } from '@/components/app/table-wrapper';
import { getModeration } from '@/lib/ai-api';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Page() {
  let state = null;
  let error: string | null = null;

  // Страница обязана открыться и тогда, когда сервис генерации недоступен:
  // иначе по пустому экрану не понять, барьер сломан или админка.
  try {
    state = await getModeration();
  } catch (e) {
    error = e instanceof Error ? e.message : 'сервис генерации не ответил';
  }

  // Имена берём из базы бота: в состоянии барьера лежат только id, а решать
  // «снять или оставить» по девятизначному числу невозможно. Кого в базе нет
  // (писал в инлайне и в таблицу не попал) — остаётся одним id, и это честнее
  // выдуманного имени.
  const listed = state?.users.length
    ? await prisma.users.findMany({
        where: { id: { in: state.users.map((id) => BigInt(id)) } },
      })
    : [];

  const names: Record<string, string> = {};
  listed.forEach((user) => {
    names[String(user.id)] = [user.name ? `@${user.name}` : '', user.alternative_name ?? '']
      .filter(Boolean)
      .join(' · ');
  });

  return (
    <TableWrapper title="Барьер содержания">
      <AiModerationForm state={state} error={error} names={names} />
    </TableWrapper>
  );
}
