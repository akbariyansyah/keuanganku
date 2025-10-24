"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ChevronDown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Controller } from "react-hook-form"
import { createColumns } from "./column"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useUiStore } from "@/store/ui"
import { Transaction } from "@/types/transaction"
import {
  createTransaction,
  fetchTransactionCategories,
  fetchTransactions,
} from "@/lib/fetcher/transaction"
import TableSkeleton from "@/components/table-skeleton"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SelectLabel } from "@radix-ui/react-select"
import { createTransactionSchema } from "@/schema/schema"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export const TYPE_OPTIONS = [
  { value: "OUT", label: "expense" },
  { value: "IN", label: "income" },
]

type createRequest = z.infer<typeof createTransactionSchema>

export interface TransactionCategory {
  id: number
  name: string
  description: string
}

export default function ExpensesPage() {
  // ===== FORM CONFIG =====
  const { register, handleSubmit, control, reset } = useForm<createRequest>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: { type: "", category_id: null, amount: 0, description: "" },
  })

  // ===== CATEGORY FETCH =====
  const [categories, setCategories] = useState<TransactionCategory[]>([])
  const [loading, setLoading] = useState(false)
  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await fetchTransactionCategories()
      setCategories(res || [])
    } catch (error) {
      console.error("Failed to fetch categories", error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchCategories()
  }, [])

  // ===== STATE & UI =====
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const currency = useUiStore((state) => state.currency)

  // ===== TRANSACTION LIST (React Query) =====
  const { data, isLoading } = useQuery({
    queryKey: ["transactions", pageIndex, pageSize],
    queryFn: () => fetchTransactions(pageIndex + 1, pageSize),
  })

  const transactions = data?.data ?? []
  const pagination = data?.pagination

  // ===== CREATE MUTATION =====
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (payload: CreateTransactionRequest) => createTransaction(payload),
    onSuccess: () => {
      toast.success("Transaction created successfully")
      queryClient.invalidateQueries({ queryKey: ["transactions"] }) 
      reset()
      setShowForm(false)
    },
    onError: () => {
      toast.error("Failed to create transaction")
    },
  })

  const columns = useMemo(() => createColumns(currency, categories), [currency, categories])

  // ===== FORM SUBMIT =====
  const onSubmit = (data: createRequest) => {
    const payload: CreateTransactionRequest = {
      type: data.type,
      amount: data.amount,
      category_id: data.category_id ?? undefined,
      description: data.description,
    }
    mutation.mutate(payload)
  }

  // ===== REACT TABLE CONFIG =====
  const table = useReactTable<Transaction>({
    data: transactions,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater
      setPageIndex(next.pageIndex)
      setPageSize(next.pageSize)
    },
    manualPagination: true,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    pageCount: pagination?.totalPages ?? -1,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
  })

  // ===== RENDER =====
  return (
    <div className="w-300 px-12">
      <div className="flex items-end">
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus /> Add
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
              <DialogDescription>Record your transaction here.</DialogDescription>
            </DialogHeader>

            {/* FORM */}
            <form id="txForm" onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid gap-3">
                <Label>Type</Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="p-2 border rounded-md w-95 h-10">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Type</SelectLabel>
                          {TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="grid gap-3">
                <Label>Category</Label>
                <Controller
                  control={control}
                  name="category_id"
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <SelectTrigger className="p-2 border rounded-md w-95 h-10">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Category</SelectLabel>
                          {categories.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id.toString()}>
                              {opt.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="grid gap-3">
                <Label>Amount</Label>
                <Input
                  type="number"
                  {...register("amount", { valueAsNumber: true })}
                  placeholder="Amount"
                />
              </div>

              <div className="grid gap-3">
                <Label>Description</Label>
                <Input
                  {...register("description")}
                  id="description"
                  placeholder="Buy snack..."
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" form="txForm" disabled={mutation.isPending}>
                  {mutation.isPending ? "Creating..." : "Create transaction"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ==== TABLE ==== */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Search description..."
          value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("description")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <TableSkeleton />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={loading || pageIndex <= 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={
              loading ||
              (pagination ? pageIndex + 1 >= pagination.totalPages : false)
            }
          >
            Next
          </Button>

          <select
            className="border rounded px-1 pr-1 ml-2"
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            disabled={loading}
          >
            {[5, 10, 20, 50].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
