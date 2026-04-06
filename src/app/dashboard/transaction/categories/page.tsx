'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';
import {
  deleteCategoryTransaction,
  fetchTransactionCategories,
} from '@/lib/fetcher/transaction';
import {
  MoreHorizontalIcon,
  Pen,
  PlusCircleIcon,
  TrashIcon,
} from 'lucide-react';
import EditTransactionCategory from './edit';
import AddTransactionCategory from './add';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/lib/react-query/keys';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { toast } from 'sonner';
import { DialogFooter } from '@/components/ui/dialog';

export interface Category {
  id: number;
  name: string;
  type: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function CategoriesPage() {
  const [showEditForm, setShowEditForm] = useState(false);
  const [open, setOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: qk.transactionCategories,
    queryFn: () => fetchTransactionCategories('ALL'),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  function handleOpenAdd(show: boolean) {
    setShowAddForm(show);
  }

  function handleOpenEdit(category: Category) {
    setSelectedCategory(category);
    setShowEditForm(true);
  }

  function handleEditModalChange(show: boolean) {
    setShowEditForm(show);
    if (!show) setSelectedCategory(null);
  }

  const mutation = useMutation({
    mutationFn: (id: number) => deleteCategoryTransaction(id.toString()),
    onSuccess: () => {
      toast.success('Category deleted successfully');
      queryClient.invalidateQueries({ queryKey: qk.transactionCategories });
    },
    onError: () => {
      toast.error('Failed to delete category transaction');
    },
  });

  const openModal = (id: number) => {
    setDeleteId(id);
    setOpen(true);
  };

  async function handleDelete() {
    if (deleteId !== null) {
      mutation.mutate(deleteId);
      setOpen(false);
    }
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="py-4">
              Are you sure you want to delete this category?
            </DialogTitle>
            <DialogFooter className="mt-6">
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => handleDelete()}>
                  Yes
                </Button>
              </div>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <EditTransactionCategory
        showForm={showEditForm}
        setShowForm={handleEditModalChange}
        categoryData={selectedCategory}
      />
      <AddTransactionCategory
        showForm={showAddForm}
        setShowForm={setShowAddForm}
      />
      <div className="flex justify-between px-8 py-8">
        <div>
          <h2>Transaction Categories</h2>
        </div>
        <div>
          <Button onClick={() => handleOpenAdd(true)}>
            <PlusCircleIcon /> Add Category
          </Button>
        </div>
      </div>
      <div className="px-8">
        <Table className="px-8">
          <TableCaption className="mt-10">
            Current Transaction Categories.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <Spinner />
                  </div>
                </TableCell>
              </TableRow>
            ) : response && response.length > 0 ? (
              response.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.id}</TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => handleOpenEdit(category as Category)}
                        >
                          <Pen />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-red-500"
                          onSelect={() => openModal(category.id)}
                        >
                          <TrashIcon color="#fa0000" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No categories found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
