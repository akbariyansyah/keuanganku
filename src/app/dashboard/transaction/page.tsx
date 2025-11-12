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
import { CalendarIcon, ChevronDown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Controller, useForm, useWatch } from "react-hook-form"
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
import { Transaction, TransactionType } from "@/types/transaction"
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: "OUT", label: "expense" },
  { value: "IN", label: "income" },
]

type createRequest = z.infer<typeof createTransactionSchema>

export interface TransactionCategory {
  id: number
  name: string
  description: string
  type: TransactionType
}

export type TransactionCategoryMap = Record<TransactionType, TransactionCategory[]>

type DateRangeState = {
  start: Date | null
  end: Date | null
}

export default function ExpensesPage() {
  // ===== FORM CONFIG =====
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<createRequest>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: { type: "", category_id: null, amount: 0, description: "", created_at: new Date() },
  })

  const selectedType = useWatch({ control, name: "type" }) as TransactionType | ""
  const selectedCategoryId = useWatch({ control, name: "category_id" }) as number | null

  // ===== CATEGORY FETCH =====
  const [categories, setCategories] = useState<TransactionCategoryMap>({ IN: [], OUT: [] })
  const [loading, setLoading] = useState(false)
  const fetchCategories = async () => {
    setLoading(true)
    try {
      const [outCategories, inCategories] = await Promise.all([
        fetchTransactionCategories("OUT"),
        fetchTransactionCategories("IN"),
      ])
      setCategories({
        OUT: outCategories ?? [],
        IN: inCategories ?? [],
      })
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
  const [descriptionFilter, setDescriptionFilter] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [dateDialogOpen, setDateDialogOpen] = useState(false)
  const [appliedDateRange, setAppliedDateRange] = useState<DateRangeState>({ start: null, end: null })
  const [draftDateRange, setDraftDateRange] = useState<DateRangeState>({ start: null, end: null })

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(descriptionFilter.trim())
    }, 300)
    return () => clearTimeout(id)
  }, [descriptionFilter])

  useEffect(() => {
    setPageIndex(0)
  }, [debouncedSearch])

  useEffect(() => {
    setPageIndex(0)
  }, [appliedDateRange.start, appliedDateRange.end])

  const handleDateDialogChange = (open: boolean) => {
    setDateDialogOpen(open)
    if (open) {
      setDraftDateRange({
        start: appliedDateRange.start ? new Date(appliedDateRange.start) : null,
        end: appliedDateRange.end ? new Date(appliedDateRange.end) : null,
      })
    }
  }

  const applyDateFilter = () => {
    setAppliedDateRange({
      start: draftDateRange.start,
      end: draftDateRange.end,
    })
    setDateDialogOpen(false)
  }

  const clearDateFilter = () => {
    const resetRange: DateRangeState = { start: null, end: null }
    setDraftDateRange(resetRange)
    setAppliedDateRange(resetRange)
  }

  const hasActiveDateFilter = Boolean(appliedDateRange.start || appliedDateRange.end)
  const formatDateLabel = (date: Date | null) =>
    date
      ? date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      : "Any time"
  const dateFilterSummary = hasActiveDateFilter
    ? `${formatDateLabel(appliedDateRange.start)} - ${formatDateLabel(appliedDateRange.end)}`
    : "All dates"

  const currency = useUiStore((state) => state.currency)

  const normalizedStartDate = appliedDateRange.start ? new Date(appliedDateRange.start) : null
  if (normalizedStartDate) {
    normalizedStartDate.setHours(0, 0, 0, 0)
  }
  const normalizedEndDate = appliedDateRange.end ? new Date(appliedDateRange.end) : null
  if (normalizedEndDate) {
    normalizedEndDate.setHours(23, 59, 59, 999)
  }
  const startDateQueryParam = normalizedStartDate?.toISOString()
  const endDateQueryParam = normalizedEndDate?.toISOString()

  // ===== TRANSACTION LIST (React Query) =====
  const { data, isLoading } = useQuery({
    queryKey: [
      "transactions",
      pageIndex,
      pageSize,
      debouncedSearch,
      startDateQueryParam,
      endDateQueryParam,
    ],
    queryFn: () =>
      fetchTransactions({
        page: pageIndex + 1,
        limit: pageSize,
        description: debouncedSearch || undefined,
        startDate: startDateQueryParam,
        endDate: endDateQueryParam,
      }),
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
      reset({ type: "", category_id: null, amount: 0, description: "", created_at: new Date() })
      setShowForm(false)
    },
    onError: () => {
      toast.error("Failed to create transaction")
    },
  })

  const columns = useMemo(() => createColumns(currency, categories), [currency, categories])
  const availableCategories = selectedType ? categories[selectedType as TransactionType] ?? [] : []

  useEffect(() => {
    if (!selectedType) {
      setValue("category_id", null)
      return
    }
    if (
      selectedCategoryId &&
      !(categories[selectedType as TransactionType]?.some((cat) => cat.id === selectedCategoryId))
    ) {
      setValue("category_id", null)
    }
  }, [categories, selectedCategoryId, selectedType, setValue])

  // ===== FORM SUBMIT =====
  const onSubmit = (data: createRequest) => {
    const payload: CreateTransactionRequest = {
      type: data.type,
      amount: data.amount,
      category_id: data.category_id ?? undefined,
      description: data.description,
      created_at: data.created_at?.toISOString(),
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
                      value={field.value ? field.value.toString() : ""}
                      onValueChange={(val) => field.onChange(Number(val))}
                      disabled={!selectedType || availableCategories.length === 0}
                    >
                      <SelectTrigger className="p-2 border rounded-md w-95 h-10">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Category</SelectLabel>
                          {availableCategories.map((opt) => (
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
                <Label>Transaction Time</Label>
                <Controller
                  control={control}
                  name="created_at"
                  render={({ field }) => {
                    const formattedDate = field.value
                      ? field.value.toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Pick a date"

                    const timeValue = field.value
                      ? `${field.value.getHours().toString().padStart(2, "0")}:${field.value
                          .getMinutes()
                          .toString()
                          .padStart(2, "0")}`
                      : ""

                    const handleDateSelect = (day?: Date) => {
                      if (!day) {
                        field.onChange(undefined)
                        return
                      }
                      const current = field.value ?? new Date()
                      const next = new Date(day)
                      next.setHours(
                        current.getHours(),
                        current.getMinutes(),
                        current.getSeconds(),
                        current.getMilliseconds()
                      )
                      field.onChange(next)
                    }

                    const handleTimeChange = (value: string) => {
                      if (!value) {
                        field.onChange(undefined)
                        return
                      }
                      const [hours, minutes] = value.split(":").map(Number)
                      const base = field.value ? new Date(field.value) : new Date()
                      base.setHours(hours, minutes, 0, 0)
                      field.onChange(base)
                    }

                    return (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formattedDate}
                            {field.value && (
                              <span className="ml-2 text-muted-foreground text-sm">
                                {timeValue || "00:00"}
                              </span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={handleDateSelect}
                            initialFocus
                          />
                          <div className="border-t px-3 py-2">
                            <Label className="text-xs text-muted-foreground mb-1 block">
                              Time
                            </Label>
                            <Input
                              type="time"
                              step="60"
                              value={timeValue}
                              onChange={(event) => handleTimeChange(event.target.value)}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    )
                  }}
                />
                {errors.created_at && (
                  <p className="text-sm text-destructive">{errors.created_at.message}</p>
                )}
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
          value={descriptionFilter}
          onChange={(event) => setDescriptionFilter(event.target.value)}
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
        <Dialog open={dateDialogOpen} onOpenChange={handleDateDialogChange}>
          <DialogTrigger asChild>
            <Button variant="outline" className="ml-2">
              Date Filter
              <span className="ml-2 text-xs text-muted-foreground">{dateFilterSummary}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Filter by date</DialogTitle>
              <DialogDescription>
                Choose a start and end date to limit visible transactions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-2 block">Start date</Label>
                <Calendar
                  mode="single"
                  selected={draftDateRange.start ?? undefined}
                  onSelect={(value) =>
                    setDraftDateRange((prev) => ({ ...prev, start: value ?? null }))
                  }
                  initialFocus
                />
              </div>
              <div>
                <Label className="mb-2 block">End date</Label>
                <Calendar
                  mode="single"
                  selected={draftDateRange.end ?? undefined}
                  onSelect={(value) =>
                    setDraftDateRange((prev) => ({ ...prev, end: value ?? null }))
                  }
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-between">
              <Button type="button" variant="ghost" onClick={clearDateFilter}>
                Clear
              </Button>
              <div className="space-x-2">
                <Button type="button" variant="outline" onClick={() => setDateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={applyDateFilter}>
                  Apply
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
