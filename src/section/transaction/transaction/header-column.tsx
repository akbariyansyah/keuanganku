import { Button } from '@/components/ui/button';
import { DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Transaction } from '@/types/transaction';
import { CurrencyCode, formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/formatter';
import { Checkbox } from '@radix-ui/react-checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Trash2, View } from 'lucide-react';

import { useState } from 'react';
import { toast } from 'sonner';
import ModalForm from './edit-form';
import { TransactionCategoryMap } from '@/constant/transaction-category';
import { deleteTransaction } from '@/lib/fetcher/transaction';
import { useQueryClient, useMutation } from '@tanstack/react-query';

const categoryColorMap: Record<number, string> = {
  1: 'bg-blue-100 text-blue-700',
  2: 'bg-yellow-100 text-yellow-800',
  3: 'bg-purple-100 text-purple-700',
  4: 'bg-pink-100 text-pink-700',
  5: 'bg-indigo-100 text-indigo-700',
  6: 'bg-teal-100 text-teal-700',
  7: 'bg-orange-100 text-orange-700',
  8: 'bg-cyan-100 text-cyan-700',
  9: 'bg-violet-100 text-violet-700',
  10: 'bg-sky-100 text-sky-700',
  11: 'bg-emerald-100 text-emerald-800',
  12: 'bg-fuchsia-100 text-fuchsia-700',
  13: 'bg-slate-100 text-slate-700',
  14: 'bg-amber-100 text-amber-700',
};

export const createColumns = (
  currency: CurrencyCode,
  transactionCategories: TransactionCategoryMap,
): ColumnDef<Transaction>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'no',
    header: 'No',
    cell: ({ row }) => (
      <span className="font-sm whitespace-nowrap tabular-nums text-xs">
        {row.index + 1}
      </span>
    ),
  },
  {
    accessorKey: 'id',
    header: 'Transaction ID',
    cell: ({ row }) => (
      <span className="font-mono whitespace-nowrap tabular-nums text-xs">
        {row.original.id}
      </span>
    ),
  },
  {
    accessorKey: 'type',
    header: () => <div className="text-center">Type</div>,
    cell: ({ row }) => {
      const type = row.getValue('type') as 'IN' | 'OUT';

      return (
        <div className="text-center font-medium">
          <span
            className={
              type === 'IN'
                ? 'rounded-md bg-green-100 px-4 py-0.5 text-xs font-semibold text-green-700'
                : 'rounded-md bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700'
            }
          >
            {type}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'category_name',
    header: ({ column }) => {
      return <Button variant="ghost">Category</Button>;
    },
    cell: ({ row }) => {
      const className = `
  rounded-md px-2 py-0.5 text-xs font-semibold
  ${categoryColorMap[row.original.category_id] ?? 'bg-gray-100 text-gray-700'}
`;

      return (
        <div className="lowercase">
          <span className={className}>{row.getValue('category_name')}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'tag',
    header: ({ column }) => {
      return <Button variant="ghost">Tags</Button>;
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue('tag')}</div>,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Description
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue('description')}</div>
    ),
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Created At
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase">{formatDate(row.getValue('created_at'))}</div>
    ),
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => {
      return (
        <div className="ml-auto text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Amount
            <ArrowUpDown />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const amount = formatCurrency(row.getValue('amount'), currency);

      return <div className="text-right font-medium">{amount}</div>;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const transaction = row.original;
      const queryClient = useQueryClient();
      const [open, setOpen] = useState(false);
      const [loading, setLoading] = useState(false);
      const mutation = useMutation({
        mutationFn: (id: string) => deleteTransaction(id),
        onSuccess: () => {
          toast.success('Transaction deleted successfully');
          setLoading(false);
          // invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          queryClient.invalidateQueries({ queryKey: ['reports'] });
          setOpen(false);
        },
        onError: () => {
          toast.error('Failed to delete transaction');
        },
      });

      const onSubmitDelete = () => {
        mutation.mutate(transaction.id);
      };

      const [showEditForm, setShowEditForm] = useState(false);

      const data = row.original;
      return (
        <>
          <ModalForm
            showForm={showEditForm}
            setShowForm={setShowEditForm}
            transactionData={data}
            transactionCategories={transactionCategories}
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className='py-4'>
                  Are you sure you want to delete this transaction?
                </DialogTitle>
                <DialogFooter className="mt-6">
                  <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={onSubmitDelete}>
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Spinner /> <p>please wait...</p>
                        </div>
                      ) : (
                        'Yes'
                      )}
                    </Button>
                  </div>
                </DialogFooter>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="pt-2 gap-1">
              <DropdownMenuItem
                onClick={() => {
                  setShowEditForm(true);
                }}
              >
                <View /> View
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => setOpen(true)}
              >
                <Trash2 color="#fa0000" /> Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
  },
];
