import { Button } from "@/components/ui/button"
import { Transaction } from "@/types/transaction"
import { CurrencyCode, formatCurrency } from "@/utils/currency"
import { formatDate } from "@/utils/formatter"
import { Checkbox } from "@radix-ui/react-checkbox"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

export const createColumns = (currency: CurrencyCode): ColumnDef<Transaction>[] => [
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
    }
    ,
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
            const payment = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>View</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(payment.id)}
                        >
                            Copy Transaction ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
