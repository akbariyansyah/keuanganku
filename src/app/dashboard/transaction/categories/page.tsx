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
import { MoreHorizontalIcon, PlusCircleIcon } from "lucide-react";
import EditTransactionCategory from "./edit";
import AddTransactionCategory from "./add";

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function handleOpenAdd(show:boolean) {
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

  async function fetchCategories() {
    try {
      const res = await fetch('/api/transaction/categories');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error_message || 'Failed to fetch categories');
      setCategories(json.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete category "${name}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/transaction/categories/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error_message || 'Failed to delete');
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to delete category');
    }
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
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.id}</TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.description || '-'}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontalIcon />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEdit(category)}>Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => handleDelete(category.id, category.name)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
