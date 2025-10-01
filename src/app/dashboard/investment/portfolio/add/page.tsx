"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, TrashIcon, X } from "lucide-react";
import { createInvestmentSchema } from '@/schema/schema'
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type InvestmentItem = {
    type: string;
    category: string;
    ticker: string;
    value: number | "";
    valuation: number | "";
};

type InvestmentForm = z.infer<typeof createInvestmentSchema>;

export default function AddInvestment() {
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
        { type: "", category: "", ticker: "", value: "", valuation: "" },
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
        if (field === "value" || field === "valuation") {
            newItems[index][field] = value === "" ? "" : Number(value);
        } else {
            newItems[index][field] = value as string;
        }
        setItems(newItems);
    };

    const addRow = () => {
        setItems([
            ...items,
            { type: "", category: "", ticker: "", value: "", valuation: "" },
        ]);
    };

    const removeRow = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting", items);
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-semibold m-6">Add new investment here</h1>
            <form
                onSubmit={handleAdd}
                className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-md w-full"
            >
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="flex flex-row gap-3 mb-4 items-center w-full h-10"
                    >
                        <input
                            {...register(`items.${index}.type`)}
                            placeholder="Type"
                            className="p-2 border rounded-md flex-1"
                            value={item.type}
                            onChange={(e) =>
                                handleChange(index, "type", e.target.value)
                            }
                        />
                        <input
                            placeholder="Category"
                            className="p-2 border rounded-md flex-1"
                            value={item.category}
                            onChange={(e) =>
                                handleChange(index, "category", e.target.value)
                            }
                        />
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
                            onChange={(e) => handleChange(index, "value", e.target.value)}
                            onWheel={(e) => e.currentTarget.blur()}
                        />
                        <input
                            placeholder="Valuation"
                            type="number"
                            className="p-2 border rounded-md w-32"
                            value={item.valuation}
                            onChange={(e) =>
                                handleChange(index, "valuation", e.target.value)
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
