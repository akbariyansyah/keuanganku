"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, TrashIcon, X } from "lucide-react";
import { createInvestmentSchema } from '@/schema/schema'
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectContent, SelectGroup, SelectItem, SelectLabel } from "@/components/ui/select";
import { createInvestment, fetchCategories } from "@/lib/fetcher/api";
import TodayDate from "@/utils/date";


const VALUE_TYPE = [
    { value: "asset", label: "Asset" },
    { value: "liabilities", label: "Liabilities" },
];

type InvestmentForm = z.infer<typeof createInvestmentSchema>;

export default function AddInvestment() {
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([])

    const fetchOptionCategories = async () => {
        try {
            const res = await fetchCategories();
            setCategories(res || []);
        } catch (err) {
            console.log('error happen when fetching categories', err)
        }
    }

    useEffect(() => {
        fetchOptionCategories();
    }, []);

    const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<InvestmentForm>({
        resolver: zodResolver(createInvestmentSchema),
        defaultValues: {
            date: "",
            total: 0,
            items: [
                { type: "", category_id: 0, ticker: "", value: 0, valuation: 0 },
            ],
        },
    });

    const [items, setItems] = useState<InvestmentItem[]>([
        { type: "", category_id: 0, ticker: "", value: 0, valuation: 0 },
    ]);
    const loading = false;

    let isDisabled = items.length === 1;

    const handleChange = (
        index: number,
        field: keyof InvestmentItem,
        value: string | number
    ) => {
        const newItems = [...items];
        // cast to number if numeric fields
        if (field === "value" || field === "valuation" || field == "category_id") {
            // newItems[index][field] = value === "" ? "" : Number(value);
            newItems[index][field] = Number(value)
        } else {
            newItems[index][field] = value as string;
        }
        setItems(newItems);
    };

    const addRow = () => {
        setItems([
            ...items,
            { type: "", category_id: 0, ticker: "", value: 0, valuation: 0 },
        ]);
    };

    const removeRow = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        let totalAmount: number = 0;

        items.map(i => totalAmount += i.valuation);

        const request: CreateInvestmentRequest = {
            total_amount: totalAmount,
            date: TodayDate(),
            items: items,
        }
        const res = await createInvestment(request)
        console.log('response', res)
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-semibold m-6">Record your investment here</h1>
            <form
                onSubmit={handleAdd}
                className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-md w-full"
            >
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="flex flex-row gap-3 mb-4 items-center h-10"
                    >
                        <Select
                            value={item.type ?? undefined}
                            onValueChange={(val) => handleChange(index, 'type', val)}
                        >
                            <SelectTrigger className="p-2 border rounded-md flex-1">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Type</SelectLabel>
                                    {VALUE_TYPE.map((opt) => (
                                        <SelectItem key={opt.label} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <Select
                            value={item.category_id.toString() ?? undefined}
                            onValueChange={(val) => handleChange(index, "category_id", Number(val))}
                        >
                            <SelectTrigger className="p-2 border rounded-md flex-1 w-50">
                                <SelectValue placeholder="Select Category"/>
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectGroup>
                                    <SelectLabel>Category</SelectLabel>
                                    {categories.map((opt) => (
                                        <SelectItem key={opt.name} value={opt.id.toString()}>
                                            {opt.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <input
                            placeholder="Ticker"
                            className="p-2 border rounded-md w-32"
                            value={item.ticker}
                            onChange={(e) => handleChange(index, "ticker", e.target.value)}
                        />
                        <input
                            placeholder="Value"
                            type="number"
                            className="p-2 border rounded-md w-28"
                            value={item.value}
                            onChange={(e) => handleChange(index, "value", Number(e.target.value))}
                            onWheel={(e) => e.currentTarget.blur()}
                        />
                        <input
                            placeholder="Valuation"
                            type="number"
                            className="p-2 border rounded-md w-32"
                            value={item.valuation}
                            onChange={(e) =>
                                handleChange(index, "valuation", Number(e.target.value))
                            }
                            onWheel={(e) => e.currentTarget.blur()}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="group"
                            disabled={isDisabled}
                            onClick={() => removeRow(index)}
                        >
                            <TrashIcon className="w-4 h-4 text-gray-500 group-hover:text-red-500" />
                        </Button>
                    </div>
                ))}

                <div className="flex justify-between mt-10">
                    <Button type="button" onClick={addRow}>
                        <Plus /> Add Item
                    </Button>
                    <Button className="w-32" disabled={loading} type="submit">
                        {loading ? "Loading..." : "Save"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
