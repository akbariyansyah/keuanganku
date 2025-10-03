"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Plus, TrashIcon } from "lucide-react";
import { createInvestmentSchema } from "@/schema/schema";
import { z } from "zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Select, SelectTrigger, SelectValue,
    SelectContent, SelectGroup, SelectItem, SelectLabel
} from "@/components/ui/select";
import { createInvestment, fetchCategories } from "@/lib/fetcher/api";
import TodayDate from "@/utils/date";
import { useRouter } from "next/navigation";

const VALUE_TYPE = [
    { value: "asset", label: "Asset" },
    { value: "liabilities", label: "Liabilities" },
];

type InvestmentForm = z.infer<typeof createInvestmentSchema>;

export default function AddInvestment() {
    const router = useRouter();
    const [categories, setCategories] = React.useState<{ id: number; name: string }[]>([]);

    React.useEffect(() => {
        (async () => {
            try {
                const res = await fetchCategories();
                setCategories(res || []);
            } catch (err) {
                console.log("error happen when fetching categories", err);
            }
        })();
    }, []);

    const {
        control,
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
    } = useForm<InvestmentForm>({
        resolver: zodResolver(createInvestmentSchema),
        mode: "onChange",
        defaultValues: {
            date: TodayDate(),
            total: 0,
            items: [{ type: "", category_id: 0, ticker: "", valuation: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "items" });

    const onSubmit = async (data: InvestmentForm) => {
        const totalAmount = data.items.reduce((sum, i) => sum + i.valuation, 0);

        const request: CreateInvestmentRequest = {
            total_amount: totalAmount,
            date: data.date,
            items: data.items,
        };

        const res = await createInvestment(request);
        if (res.message) {
            router.push("/dashboard/investment/portfolio");
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-semibold m-6">Record your investment here</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-md w-full">
                {fields.map((field, index) => (
                    <div key={field.id}>
                        <div className="flex flex-row gap-3 mb-4 mt-4 items-center h-10">

                            {/* TYPE */}
                            <Controller
                                name={`items.${index}.type`}
                                control={control}
                                defaultValue={field.type ?? ""} // avoid undefined
                                render={({ field, fieldState }) => (
                                    <>
                                        <Select
                                            value={field.value ?? ""}
                                            onValueChange={(v) => {
                                                field.onChange(v);        // update RHF
                                                // field.onBlur();        // optional: mark touched immediately
                                            }}
                                            onOpenChange={(open) => {
                                                if (!open) field.onBlur(); // mark touched when dropdown closes
                                            }}
                                        >
                                            <SelectTrigger
                                                className="p-2 border rounded-md flex-1"
                                                onBlur={field.onBlur}       // ✅ attach onBlur here, not on <Select>
                                            >
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Type</SelectLabel>
                                                    {VALUE_TYPE.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>

                                        {fieldState.error && (
                                            <div>
                                                <p className="text-red-600 text-sm">{fieldState.error.message}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            />


                            {/* CATEGORY */}
                            <Controller
                                name={`items.${index}.category_id`}
                                control={control}
                                defaultValue={field.category_id ?? 0}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Select
                                            value={String(field.value ?? 0)}
                                            onValueChange={(v) => field.onChange(Number(v))}
                                            onOpenChange={(open) => {
                                                if (!open) field.onBlur();
                                            }}
                                        >
                                            <SelectTrigger
                                                className="p-2 border rounded-md flex-1 w-50"
                                                onBlur={field.onBlur}     // ✅ blur goes here
                                            >
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent position="popper">
                                                <SelectGroup>
                                                    <SelectLabel>Category</SelectLabel>
                                                    {categories.map((opt) => (
                                                        <SelectItem key={opt.id} value={String(opt.id)}>
                                                            {opt.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>

                                        {fieldState.error && (
                                            <p className="text-red-600 text-sm">{fieldState.error.message}</p>
                                        )}
                                    </>
                                )}
                            />


                            {/* TICKER */}
                            <input
                                {...register(`items.${index}.ticker`)}
                                placeholder="Ticker"
                                className="p-2 border rounded-md w-32"
                            />
                            {errors.items?.[index]?.ticker?.message && (
                                <p className="text-red-600 text-sm">{errors.items[index]!.ticker!.message}</p>
                            )}

                            {/* VALUATION */}
                            <input
                                type="number"
                                {...register(`items.${index}.valuation`, { valueAsNumber: true })}
                                placeholder="Valuation"
                                className="p-2 border rounded-md w-32"
                                onWheel={(e) => e.currentTarget.blur()}
                            />
                            {errors.items?.[index]?.valuation?.message && (
                                <p className="text-red-600 text-sm">{errors.items[index]!.valuation!.message}</p>
                            )}

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="group"
                                disabled={fields.length === 1}
                                onClick={() => remove(index)}
                            >
                                <TrashIcon className="w-4 h-4 text-gray-500 group-hover:text-red-500" />
                            </Button>
                        </div>
                        <div className="flex flex-row gap-3 mb-4 mt-4 items-center h-10">

                        </div>
                    </div>
                ))}

                <div className="flex justify-between mt-10">
                    <Button type="button" onClick={() => append({ type: "", category_id: 0, ticker: "", valuation: 0 })}>
                        <Plus /> Add Item
                    </Button>
                    <Button className="w-32" type="submit">
                        {isSubmitting ? "Loading..." : "Save"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
