import { AddPhrazeForm } from '@/components/app/add-phraze-form';
import { PhrazesRow } from '@/components/app/phrazes-row';
import { TableWrapper } from '@/components/app/table-wrapper';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import prisma from '@/lib/prisma';

export default async function Page() {
  const data = await prisma.phrazes.findMany();

  return (
    <TableWrapper title="Фразы">
      <AddPhrazeForm />

      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Ключ</TableHead>
            <TableHead>Фраза</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item) => (
            <PhrazesRow key={`${item.key}-${item.value}`} item={item} />
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}
