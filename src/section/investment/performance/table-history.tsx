import { MoreHorizontalIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/utils/currency';
import { useUiStore } from '@/store/ui';

export function TableHistoryInvestment() {
  const currency = useUiStore((state) => state.currency);

  const data = [
    {
      id: 'testing',
      amount: formatCurrency(10000, currency),
      date: new Date().toLocaleDateString(),
    },
    {
      id: 'testing',
      amount: formatCurrency(10000, currency),
      date: new Date().toLocaleDateString(),
    },
    {
      id: 'testing',
      amount: formatCurrency(10000, currency),
      date: new Date().toLocaleDateString(),
    },
    {
      id: 'testing',
      amount: formatCurrency(10000, currency),
      date: new Date().toLocaleDateString(),
    },
    {
      id: 'testing',
      amount: formatCurrency(10000, currency),
      date: new Date().toLocaleDateString(),
    },
    {
      id: 'testing',
      amount: formatCurrency(10000, currency),
      date: new Date().toLocaleDateString(),
    },
  ];
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Id</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => {
          return (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.amount}</TableCell>
              <TableCell>{item.date}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
