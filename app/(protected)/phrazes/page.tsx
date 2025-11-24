import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import prisma from '@/lib/prisma';

export default async function Page() {
  const data = await prisma.phrazes.findMany();

  return (
    <div className="ml-10 flex flex-col items-start overflow-x-auto">
      <div className="overflow-hidden">
        <h1 className="text-4xl font-semibold">Фразы</h1>

        <div className="pt-10">
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
        </div>
      </div>
    </div>
  );
}
