"use client"

import { Button } from "@/components/ui/button"
import { Controller } from "react-hook-form";

import { Input } from "@/components/ui/input"

import { Transaction } from "@/types/transaction";
import { updateTransaction } from "@/lib/fetcher/transaction";
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
import { Select, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTransactionSchema } from "@/schema/schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { TransactionCategory, TYPE_OPTIONS } from "./page";
import { toast } from "sonner";


import { useMutation, useQueryClient } from "@tanstack/react-query";

type createRequest = z.infer<typeof createTransactionSchema>;

interface ModalProps {
    showForm: boolean;
    setShowForm: (show: boolean) => void;
    transactionData: Transaction;
    transactionCategory: TransactionCategory[];
}

export default function ModalForm(props: ModalProps) {


    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (payload: UpdateTransactionRequest) =>
            updateTransaction(transactionData.id, payload),
        onSuccess: () => {
            toast.success("Transaction updated successfully")
            queryClient.invalidateQueries({ queryKey: ["transactions"] }) // 🔥 refetch the list
            setShowForm(false)
        },
        onError: () => {
            toast.error("Failed to update transaction")
        },
    })
    const { showForm, setShowForm, transactionData, transactionCategory } = props
    const { register, handleSubmit, control, formState: { errors } } = useForm<createRequest>({
        resolver: zodResolver(createTransactionSchema),
        defaultValues: {
            type: transactionData.type,
            amount: transactionData.amount,
            category_id: transactionData.category_id,
            description: transactionData.description,
        },
    });
    const onSubmit = (data: createRequest) => {
        mutation.mutate({
            type: data.type,
            amount: data.amount,
            category_id: data.category_id ?? undefined,
            description: data.description,
        })
    }

    return (
        <>
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit  Transaction</DialogTitle>
                        <DialogDescription>Edit your transaction here.</DialogDescription>
                    </DialogHeader>

                    {/* The form must live inside DialogContent */}
                    <form id="txForm" onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                        <div className="grid gap-3">
                            <Label>Type</Label>
                            <Controller
                                control={control}
                                name="type"
                                render={({ field }) => (
                                    <Select
                                        value={field.value?.toString() || ""}
                                        onValueChange={field.onChange}>
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

                        <Controller
                            control={control}
                            name="category_id"
                            render={({ field }) => (
                                <Select
                                    value={field.value ? field.value.toString() : ""}
                                    onValueChange={(val) => field.onChange(Number(val))}
                                >
                                    <SelectTrigger className="p-2 border rounded-md w-95 h-10">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Category</SelectLabel>
                                            {transactionCategory.map((opt) => (
                                                <SelectItem key={opt.id} value={opt.id.toString()}>
                                                    {opt.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            )}
                        />

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
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" form="txForm">Update transaction</Button>

                        </DialogFooter>
                    </form>

                </DialogContent>
            </Dialog>
        </>
    )
}