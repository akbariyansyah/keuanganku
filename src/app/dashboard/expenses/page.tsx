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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus, Type } from "lucide-react"
import { Pagination } from "@/types/pagination";
import { Button } from "@/components/ui/button"

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
import { useUiStore } from "@/store/ui";

import { Transaction } from "@/types/transaction";
import { fetchTransactions } from "@/lib/fetcher/api";
import TableSkeleton from "@/components/table-skeleton";
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectLabel } from "@radix-ui/react-select";

const TYPE_OPTIONS = [{
    value: 'out',
    label: 'expense'
}, {
    value: 'in',
    label: 'income'
}];

export default function ExpensesPage() {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [showForm, setShowForm] = useState(false);

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(false);

    const [pageIndex, setPageIndex] = useState(0);   // 0-based
    const [pageSize, setPageSize] = useState(10);

    const currency = useUiStore((state) => state.currency);
    const columns = useMemo(() => createColumns(currency), [currency]);

    const [type, setType] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const loadTransactions = async (page = 1, limit = 5) => {
        setLoading(true);
        try {
            const { data, pagination } = await fetchTransactions(page, limit);
            setTransactions(data);
            setPagination(pagination);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions(pageIndex + 1, pageSize);
    }, [pageIndex, pageSize]);

    const table = useReactTable<Transaction>({
        data: transactions,
        columns,
        state: {
            sorting, columnFilters, columnVisibility, rowSelection,
            pagination: { pageIndex, pageSize },
        },
        onPaginationChange: (updater) => {
            const next = typeof updater === "function"
                ? updater({ pageIndex, pageSize })
                : updater;
            setPageIndex(next.pageIndex);
            setPageSize(next.pageSize);
        },
        manualPagination: true,
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        pageCount: pagination?.totalPages ?? -1,  // -1
        getCoreRowModel: getCoreRowModel(),
        onRowSelectionChange: setRowSelection,
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="w-270 px-12">

            <div className="flex items-right">
                <Dialog open={showForm} onOpenChange={setShowForm}>
                    <form>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Plus /> Add</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add Transaction</DialogTitle>
                                <DialogDescription>
                                    Record your transaction here.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4">
                                <div className="grid gap-3">
                                    <Label>Type</Label>
                                    <Select

                                        value={type}
                                        onValueChange={(value) => setType(value)}
                                    >
                                        <SelectTrigger
                                            className="p-2 border rounded-md w-95 h-10"
                                        >
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

                                </div>
                                <div className="grid gap-3">
                                    <Label>Category</Label>
                                    <Input id="category" name="category" />
                                </div>
                                <div className="grid gap-3">
                                    <Label>Amount</Label>
                                    <Input id="amount" name="amount" defaultValue="Input amount here..." />
                                </div>
                                <div className="grid gap-3">
                                    <Label>Description</Label>
                                    <Input id="description" name="description" defaultValue="Buy snack..." />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit">Save changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </form>
                </Dialog>
            </div>
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
                            .map((column) => {
                                return (
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
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
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
                                    <TableSkeleton />
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
                        variant="outline" size="sm"
                        onClick={() => table.previousPage()}
                        disabled={loading || pageIndex <= 0}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline" size="sm"
                        onClick={() => table.nextPage()}
                        disabled={loading || (pagination ? pageIndex + 1 >= pagination.totalPages : false)}
                    >
                        Next
                    </Button>

                    <select
                        className="border rounded px-1 pr-1 ml-2"
                        value={pageSize}
                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                        disabled={loading}
                    >
                        {[5, 10, 20, 50].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

            </div>
        </div>
    )
}

