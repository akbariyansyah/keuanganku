import { Button } from "@/components/ui/button"
import { DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { Transaction } from "@/types/transaction"
import { CurrencyCode, formatCurrency } from "@/utils/currency"
import { formatDate } from "@/utils/formatter"
import { Checkbox } from "@radix-ui/react-checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Plus } from "lucide-react"

import { useState } from "react"
import { toast } from "sonner";
import ModalForm from "./edit-form"
import { TransactionCategory } from "./page"
import { deleteTransaction } from "@/lib/fetcher/transaction"
import { useQueryClient, useMutation } from "@tanstack/react-query"


export const createColumns = (currency: CurrencyCode, transactionCategory: TransactionCategory[]): ColumnDef<Transaction>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
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
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
            <span className="font-mono whitespace-nowrap tabular-nums text-xs">
                {row.original.id}
            </span>
        ),
    },
    {
        accessorKey: "type",
        header: () => <div className="text-center">Type</div>,
        cell: ({ row }) => {
            return <div className="text-center font-medium">{row.getValue("type")}</div>
        },
    },
    {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
            const amount = formatCurrency(row.getValue("amount"), currency)

            return <div className="text-right font-medium">{amount}</div>
        },
    },
    {
        accessorKey: "category_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                >
                    Category
                </Button>
            )
        },
        cell: ({ row }) => <div className="lowercase">{row.getValue("category_name")}</div>,
    },
    {
        accessorKey: "description",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Description
                    <ArrowUpDown />
                </Button>
            )
        },
        cell: ({ row }) => <div className="lowercase">{row.getValue("description")}</div>,
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Created At
                    <ArrowUpDown />
                </Button>
            )
        },
        cell: ({ row }) => <div className="lowercase">{formatDate(row.getValue("created_at"))}</div>,
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const transaction = row.original;
            const queryClient = useQueryClient();
            const [open, setOpen] = useState(false);
            const [loading, setLoading] = useState(false);
            const mutation = useMutation({
                mutationFn: (id: string) => deleteTransaction(id),
                onSuccess: () => {

                    toast.success("Transaction deleted successfully");
                    setLoading(false);
                    queryClient.invalidateQueries({ queryKey: ["transactions"] })
                    setOpen(false);
                },
                onError: () => {
                    toast.error("Failed to delete transaction")
                }
            });

            const onSubmitDelete = () => {
                mutation.mutate(transaction.id)
            }

            const [showEditForm, setShowEditForm] = useState(false);


            const data = row.original;
            return (
                <>
                    <ModalForm showForm={showEditForm} setShowForm={setShowEditForm} transactionData={data} transactionCategory={transactionCategory} />
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Are you absolutely sure?</DialogTitle>
                                <DialogFooter className="mt-6">
                                    <div className="flex justify-end gap-4">
                                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                        <Button variant="default" onClick={onSubmitDelete}>
                                            {loading ? <div className="flex items-center gap-2">
                                                <Spinner /> <p>
                                                    please wait...</p></div> : "Sure"}
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
                                View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setOpen(true)}
                            >
                                Delete
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>

            )
        },
    },
]
