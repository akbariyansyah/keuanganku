'use client';

import { useEffect, useMemo, useState } from 'react';
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
} from '@tanstack/react-table';
import { ChevronDown } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { createColumns } from './header-column';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUiStore } from '@/store/ui';
import { Transaction, TransactionType } from '@/types/transaction';
import {
  createTransaction,
  fetchTransactionCategories,
  fetchTransactions,
} from '@/lib/fetcher/transaction';
import TableSkeleton from '@/components/common/table-skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { createTransactionSchema } from '@/schema/schema';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';

import { TYPE_OPTIONS } from '@/constant/options';
import { formatCurrency } from '@/utils/currency';
import AddTransactionForm from './add-form';
import { Item, ItemContent, ItemTitle } from '@/components/ui/item';
import Footer from '@/components/layout/footer';
import { dateFilterCalendarClassNames } from '@/components/common/calender-filter';

type createRequest = z.infer<typeof createTransactionSchema>;

export interface TransactionCategory {
  id: number;
  name: string;
  description: string;
  type: TransactionType;
}

export type TransactionCategoryMap = Record<
  TransactionType,
  TransactionCategory[]
>;

type DateRangeState = {
  start: Date | null;
  end: Date | null;
};

type ExpensesPageProps = {
  selectedDate?: Date | null;
};

export default function ExpensesPage({
  selectedDate = null,
}: ExpensesPageProps) {
  // ===== FORM CONFIG =====
  const {
    control,
    reset,
    formState: { errors },
  } = useForm<createRequest>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: '',
      category_id: null,
      amount: 0,
      description: '',
      created_at: new Date(),
    },
  });

  const [subTotal, setSubTotal] = useState(0);

  // ===== CATEGORY FETCH =====
  const [categories, setCategories] = useState<TransactionCategoryMap>({
    IN: [],
    OUT: [],
  });
  const [loading, setLoading] = useState(false);
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const [outCategories, inCategories] = await Promise.all([
        fetchTransactionCategories('OUT'),
        fetchTransactionCategories('IN'),
      ]);
      setCategories({
        OUT: outCategories ?? [],
        IN: inCategories ?? [],
      });
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  // ===== STATE & UI =====
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [showForm, setShowForm] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [descriptionFilter, setDescriptionFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [appliedDateRange, setAppliedDateRange] = useState<DateRangeState>({
    start: null,
    end: null,
  });
  const [draftDateRange, setDraftDateRange] = useState<DateRangeState>({
    start: null,
    end: null,
  });

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(descriptionFilter.trim());
    }, 300);
    return () => clearTimeout(id);
  }, [descriptionFilter]);

  useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearch]);

  useEffect(() => {
    setPageIndex(0);
  }, [appliedDateRange.start, appliedDateRange.end]);

  useEffect(() => {
    setPageIndex(0);
  }, [typeFilter, categoryFilter]);

  useEffect(() => {
    if (!typeFilter) {
      setCategoryFilter((prev) => (prev.length ? [] : prev));
      return;
    }

    const allowedIds = new Set(
      (categories[typeFilter] ?? []).map((cat) => cat.id.toString()),
    );

    setCategoryFilter((prev) => {
      const filtered = prev.filter((id) => allowedIds.has(id));
      return filtered.length === prev.length ? prev : filtered;
    });
  }, [typeFilter, categories]);

  const handleDateDialogChange = (open: boolean) => {
    setDateDialogOpen(open);
    if (open) {
      setDraftDateRange({
        start: appliedDateRange.start ? new Date(appliedDateRange.start) : null,
        end: appliedDateRange.end ? new Date(appliedDateRange.end) : null,
      });
    }
  };

  const applyDateFilter = () => {
    setAppliedDateRange({
      start: draftDateRange.start,
      end: draftDateRange.end,
    });
    setDateDialogOpen(false);
  };

  const clearDateFilter = () => {
    const resetRange: DateRangeState = { start: null, end: null };
    setDraftDateRange(resetRange);
    setAppliedDateRange(resetRange);
  };

  const handleDraftRangeSelect = (range?: DateRange) => {
    setDraftDateRange({
      start: range?.from ?? null,
      end: range?.to ?? null,
    });
  };

  const hasActiveDateFilter = Boolean(
    appliedDateRange.start || appliedDateRange.end,
  );
  const formatDateLabel = (date: Date | null) =>
    date
      ? date.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        })
      : 'Any time';
  const dateFilterSummary = hasActiveDateFilter
    ? `${formatDateLabel(appliedDateRange.start)} - ${formatDateLabel(appliedDateRange.end)}`
    : 'All dates';

  const currency = useUiStore((state) => state.currency);

  // Sync date filter with heatmap selection (single-day filter).
  useEffect(() => {
    if (selectedDate) {
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);
      setAppliedDateRange({ start, end });
      setDraftDateRange({ start, end });
      setPageIndex(0);
      return;
    }

    // Clear when selection is removed
    setAppliedDateRange({ start: null, end: null });
    setDraftDateRange({ start: null, end: null });
  }, [selectedDate]);

  const normalizedStartDate = appliedDateRange.start
    ? new Date(appliedDateRange.start)
    : null;
  if (normalizedStartDate) {
    normalizedStartDate.setHours(0, 0, 0, 0);
  }
  const normalizedEndDate = appliedDateRange.end
    ? new Date(appliedDateRange.end)
    : null;
  if (normalizedEndDate) {
    normalizedEndDate.setHours(23, 59, 59, 999);
  }

  const startDateQueryParam = normalizedStartDate?.toString() ?? '';
  const endDateQueryParam = normalizedEndDate?.toString() ?? '';

  // ===== TRANSACTION LIST (React Query) =====
  const { data, isLoading } = useQuery({
    queryKey: [
      'transactions',
      pageIndex,
      pageSize,
      debouncedSearch,
      startDateQueryParam,
      endDateQueryParam,
      typeFilter,
      categoryFilter,
    ],
    queryFn: () =>
      fetchTransactions({
        page: pageIndex + 1,
        limit: pageSize,
        description: debouncedSearch || undefined,
        startDate: startDateQueryParam,
        endDate: endDateQueryParam,
        type: typeFilter || undefined,
        categoryId: categoryFilter.length ? categoryFilter : undefined,
      }),
  });

  const transactions = data?.data ?? [];
  const pagination = data?.pagination;

  // ===== CREATE MUTATION =====
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: CreateTransactionRequest) =>
      createTransaction(payload),
    onSuccess: () => {
      toast.success('Transaction created successfully');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setShowForm(!showForm);
    },
    onError: () => {
      toast.error('Failed to create transaction');
    },
  });

  const columns = useMemo(
    () => createColumns(currency, categories),
    [currency, categories],
  );

  const filterCategories = typeFilter
    ? (categories[typeFilter as TransactionType] ?? [])
    : [];

  const toggleCategoryFilter = (categoryId: string) => {
    setCategoryFilter((prev) => {
      const exists = prev.includes(categoryId);
      const next = exists
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId];
      return next;
    });
  };

  const categoryFilterLabel = useMemo(() => {
    if (!typeFilter) return 'Select type first';
    if (categoryFilter.length === 0) return 'All categories';
    if (categoryFilter.length === 1) {
      const selected = filterCategories.find((cat) =>
        categoryFilter.includes(cat.id.toString()),
      );
      return selected?.name ?? '1 selected';
    }
    return `${categoryFilter.length} selected`;
  }, [typeFilter, categoryFilter, filterCategories]);

  const isCategorySelectionDisabled =
    !typeFilter || filterCategories.length === 0;

  useEffect(() => {
    setSubTotal(
      transactions.reduce(
        (total, transaction) =>
          total +
          (transaction.type === 'IN'
            ? transaction.amount
            : -transaction.amount),
        0,
      ),
    );
  }, [transactions]);

  // ===== REACT TABLE CONFIG =====
  const table = useReactTable<Transaction>({
    data: transactions,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function'
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
    manualPagination: true,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    pageCount: pagination?.totalPages ?? -1,
    getCoreRowModel: getCoreRowModel(),
    // onRowSelectionChange: setRowSelection,
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
  });

  // ===== RENDER =====
  return (
    <div className="px-4 mt-4">
      {/* ==== TABLE HEADER COLUMN ==== */}
      <div className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search description..."
            value={descriptionFilter}
            onChange={(event) => setDescriptionFilter(event.target.value)}
            className="w-full min-w-[200px] sm:w-[240px] md:w-[280px]"
          />
          <Select
            value={typeFilter || 'all'}
            onValueChange={(value) =>
              setTypeFilter(value === 'all' ? '' : (value as TransactionType))
            }
          >
            <SelectTrigger className="w-[140px] sm:w-[150px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-[200px] sm:w-[220px] justify-between"
                disabled={isCategorySelectionDisabled}
              >
                <span>Categories</span>
                <span className="truncate text-xs text-muted-foreground">
                  {categoryFilterLabel}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[220px]">
              <DropdownMenuCheckboxItem
                checked={categoryFilter.length === 0}
                onCheckedChange={() => setCategoryFilter([])}
              >
                All categories
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {filterCategories.map((opt) => (
                <DropdownMenuCheckboxItem
                  key={opt.id}
                  checked={categoryFilter.includes(opt.id.toString())}
                  onCheckedChange={() =>
                    toggleCategoryFilter(opt.id.toString())
                  }
                >
                  {opt.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
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
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={dateDialogOpen} onOpenChange={handleDateDialogChange}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full max-w-[280px] justify-between sm:w-auto sm:justify-start sm:max-w-none"
              >
                <span>Date Filter</span>
                <span className="ml-2 flex-1 truncate text-xs text-muted-foreground text-right sm:text-left">
                  {dateFilterSummary}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle>Filter by date</DialogTitle>
                <DialogDescription>
                  Choose a start and end date to limit visible transactions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-1">
                <Label className="mb-1 block">Date range</Label>
                <Calendar
                  mode="range"
                  numberOfMonths={1}
                  selected={{
                    from: draftDateRange.start ?? undefined,
                    to: draftDateRange.end ?? undefined,
                  }}
                  defaultMonth={
                    draftDateRange.start ?? draftDateRange.end ?? undefined
                  }
                  onSelect={handleDraftRangeSelect}
                  showOutsideDays
                  className="rounded-lg border bg-popover p-1.5 text-popover-foreground shadow"
                  classNames={dateFilterCalendarClassNames}
                />
              </div>
              <DialogFooter className="sm:justify-between">
                <Button type="button" variant="ghost" onClick={clearDateFilter}>
                  Clear
                </Button>
                <div className="space-x-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDateDialogOpen(false)}
                  >
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
        <div>
          <AddTransactionForm
            showForm={showForm}
            setShowForm={setShowForm}
            transactionCategories={categories}
            isPending={mutation.isPending}
            onSubmit={mutation.mutate}
          />
        </div>
      </div>

      {/* ==== TABLE DATA==== */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-muted/100 h-10 px-4 text-sm font-semibold">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <TableSkeleton />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No transaction found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end my-2">
        <div className="">
          <Item variant="outline" size="sm" asChild>
            <a href="#">
              <ItemContent>
                <ItemTitle>
                  {' '}
                  Net sub total (expenses): {formatCurrency(subTotal, currency)}
                </ItemTitle>
              </ItemContent>
              {/* <ItemActions>
                <ChevronRightIcon className="size-4" />
              </ItemActions> */}
            </a>
          </Item>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4 mb-10">
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
      <Footer />
    </div>
  );
}
