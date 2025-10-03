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

    const {
        setValue,
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
    } = useForm<InvestmentForm>({
        resolver: zodResolver(createInvestmentSchema),
        mode: "onChange", // so isValid updates while typing
        defaultValues: {
            date: "",
            total: 0,
            items: [{ type: "", category_id: 0, ticker: "", valuation: 0 }],
        },
    });


    const [items, setItems] = useState<InvestmentItem[]>([
        { type: "", category_id: 0, ticker: "", valuation: 0 },
    ]);
    const loading = false;

    let isDisabled = items.length === 1;

    const [valid, setValid] = useState<boolean>(false);
    const handleChange = (
        index: number,
        field: keyof InvestmentItem,
        value: string | number
    ) => {
        const newItems = [...items];
        // cast to number if numeric fields
        if (field === "valuation" || field == "category_id") {
            // newItems[index][field] = value === "" ? "" : Number(value);
            newItems[index][field] = Number(value)
        } else {
            newItems[index][field] = value as string;
        }

        items.map((item => {
            if (item.category_id != 0 && item.ticker != "" && item.type != "" && item.valuation != 0) {
                setValid(true);
            }
        }))

        console.log(items)
        console.log(valid)
        setItems(newItems);
    };

    const addRow = () => {
        setItems([
            ...items,
            { type: "", category_id: 0, ticker: "", valuation: 0 },
        ]);
    };

    const removeRow = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleAdd = async () => {
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
                onSubmit={handleSubmit(handleAdd)}
                className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-md w-full"
            >
                {items.map((item, index) => (
                    <div
                        key={index}
                    >
                        <div className="flex flex-row gap-3 mb-4 mt-4 items-center h-10">
                            <Select
                                value={item.type ?? ""}
                                onValueChange={(val) => {
                                    handleChange(index, 'type', val)
                                    setValue(`items.${index}.type`, val, {
                                        shouldValidate: true,
                                        shouldTouch: true,
                                        shouldDirty: true,
                                    })
                                }}
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
                                onValueChange={(val) => {
                                    handleChange(index, "category_id", Number(val))
                                    setValue(`items.${index}.category_id`, Number(val), {
                                        shouldValidate: true,
                                        shouldTouch: true,
                                        shouldDirty: true,
                                    })
                                }}
                            >
                                <SelectTrigger className="p-2 border rounded-md flex-1 w-50">
                                    <SelectValue placeholder="Select Category" />
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
                                {...register(`items.${index}.ticker`)}
                                placeholder="Ticker"
                                className="p-2 border rounded-md w-32"
                                value={item.ticker}
                                onChange={(e) => handleChange(index, "ticker", e.target.value)}
                            />
                            <input
                                {...register(`items.${index}.valuation`)}
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
                        
                        <div className="flex flex-row gap-3 items-center h-2">
                            {errors.items?.[index]?.type?.message && (
                                <p className="text-red-600 text-sm">
                                    {errors.items?.[index]?.type.message}
                                </p>
                            )}
                            {errors.items?.[index]?.category_id?.message && (
                                <p className="text-red-600 text-sm">
                                    {errors.items?.[index]?.category_id.message}
                                </p>
                            )}
                            {errors.items?.[index]?.ticker?.message && (
                                <p className="text-red-600 text-sm">
                                    {errors.items?.[index]?.ticker.message}
                                </p>
                            )}
                            {errors.items?.[index]?.valuation?.message && (
                                <p className="text-red-600 text-sm">
                                    {errors.items?.[index]?.valuation.message}
                                </p>
                            )}
                        </div>
                    </div>
                ))}

                <div className="flex justify-between mt-10">
                    <Button type="button" onClick={addRow} >
                        <Plus /> Add Item
                    </Button>
                    <Button className="w-32" disabled={!valid} type="submit">
                        {loading ? "Loading..." : "Save"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
