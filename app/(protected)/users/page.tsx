import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import prisma from '@/lib/prisma';

export default async function Page() {
  const data = await prisma.users.findMany();

  return (
    <div className="ml-10 flex flex-col items-start overflow-x-auto">
      <div className="overflow-hidden">
        <h1 className="text-4xl font-semibold">Пользователи</h1>

        <div className="pt-10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>@{item.name}</TableCell>
                  <TableCell>{item.alternative_name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
