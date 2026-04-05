'use client';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from 'react';
import { fetchTransactionCategories } from '@/lib/fetcher/transaction';
import { LoaderCircle, MoreHorizontalIcon, PlusCircleIcon } from "lucide-react";
import EditTransactionCategory from "./edit";
import AddTransactionCategory from "./add";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/react-query/keys";
import { Spinner } from '@/components/ui/shadcn-io/spinner';

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: qk.transactionCategories,
    queryFn: () => fetchTransactionCategories('ALL'),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  function handleOpenAdd(show: boolean) {
    setShowAddForm(show);
  }

  console.log('transaction categories data:', response);
  function handleOpenEdit(category: Category) {
    setSelectedCategory(category);
    setShowEditForm(true);
  }

  function handleEditModalChange(show: boolean) {
    setShowEditForm(show);
    if (!show) setSelectedCategory(null);
  }

  async function handleDelete(id: number, name: string) {

  }

  return (
    <div>
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
          <h2>
            Transaction Categories
          </h2>
        </div>
        <div>
          <Button onClick={() => handleOpenAdd(true)}><PlusCircleIcon /> Add Category</Button>
        </div>
      </div>
      <div className="px-8">
        <Table className="px-8">
          <TableCaption className="mt-10">Current Transaction Categories.</TableCaption>
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
                        <DropdownMenuItem onSelect={() => handleOpenEdit(category as Category)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => handleDelete(category.id, category.name)}>
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
