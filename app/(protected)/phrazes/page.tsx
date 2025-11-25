import { TableWrapper } from '@/components/app/table-wrapper';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import prisma from '@/lib/prisma';

export default async function Page() {
  const data = await prisma.phrazes.findMany();

  return (
    <TableWrapper title="Фразы">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ключ</TableHead>
            <TableHead>Фраза</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item) => (
            <TableRow key={`${item.key}-${item.value}`}>
              <TableCell>{item.key}</TableCell>
              <TableCell>{item.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}
