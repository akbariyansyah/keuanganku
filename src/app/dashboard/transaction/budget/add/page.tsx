'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, TrashIcon, ArrowLeft } from 'lucide-react';
import { createBudgetAllocationsSchema } from '@/schema/schema';
import { z } from 'zod';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from '@/components/ui/select';
import { createBudgetAllocations } from '@/lib/fetcher/budget';
import { fetchTransactionCategories } from '@/lib/fetcher/transaction';
import { formatCurrency } from '@/utils/currency';
import { useUiStore } from '@/store/ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEffect } from 'react';
import { formatNumber, parseNumber } from '@/utils/formatter';

type BudgetAllocationForm = z.infer<typeof createBudgetAllocationsSchema>;

export default function AddBudgetPage() {
  const router = useRouter();
  const currency = useUiStore((state) => state.currency);

  const [categories, setCategories] = React.useState<
    { id: number; name: string; description: string }[]
  >([]);

  const defaultMonth = React.useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  // Fetch transaction categories (type=out for expenses)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchTransactionCategories('OUT');
        setCategories(res || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    })();
  }, []);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<BudgetAllocationForm>({
    resolver: zodResolver(createBudgetAllocationsSchema),
    mode: 'onChange',
    defaultValues: {
      month: defaultMonth,
      allocations: [{ categoryId: 0, amount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'allocations',
  });

  const watchedAllocations = useWatch({ control, name: 'allocations' });

  const subtotal = React.useMemo(() => {
    const items = Array.isArray(watchedAllocations) ? watchedAllocations : [];
    return items.reduce((sum, i) => sum + Number(i?.amount || 0), 0);
  }, [watchedAllocations]);

  const onSubmit = async (data: BudgetAllocationForm) => {
    try {
      const res = await createBudgetAllocations(data);
      if (res.message) {
        router.push('/dashboard/transaction/budget');
      }
    } catch (error) {
      console.error('Failed to create budget allocations:', error);
      alert('Failed to create budget allocations. Please try again.');
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold">Add Budget Allocation</h1>
        <p className="text-muted-foreground mt-1">
          Set your budget limits for each expense category
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.6fr_minmax(260px,1fr)] lg:grid-cols-[2fr_minmax(300px,1fr)] items-start">
        {/* Main Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-md w-full"
        >
          {/* Month Input */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">
              Budget Month
            </label>
            <input
              type="month"
              {...register('month')}
              className="p-2 border rounded-md w-full max-w-xs"
              aria-invalid={!!errors.month}
            />
            {errors.month?.message && (
              <p className="mt-1 text-xs text-red-500">
                {errors.month.message}
              </p>
            )}
          </div>

          {/* Dynamic Allocation Rows */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Category Allocations</h3>

            {fields.map((field, index) => (
              <div key={field.id}>
                <div className="flex flex-row gap-3 items-start">
                  {/* CATEGORY DROPDOWN */}
                  <div className="flex-1">
                    <Controller
                      name={`allocations.${index}.categoryId`}
                      control={control}
                      defaultValue={field.categoryId ?? 0}
                      render={({ field, fieldState }) => (
                        <div className="flex flex-col">
                          <Select
                            value={
                              field.value && field.value > 0
                                ? String(field.value)
                                : ''
                            }
                            onValueChange={(v) => field.onChange(Number(v))}
                            onOpenChange={(open) => {
                              if (!open) field.onBlur();
                            }}
                          >
                            <SelectTrigger
                              className="p-2 border rounded-md"
                              onBlur={field.onBlur}
                              aria-invalid={!!fieldState.error}
                            >
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              <SelectGroup>
                                <SelectLabel>Expense Category</SelectLabel>
                                {categories.map((opt) => (
                                  <SelectItem
                                    key={opt.id}
                                    value={String(opt.id)}
                                  >
                                    {opt.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>

                          {fieldState.error ? (
                            <p className="mt-1 text-xs text-red-500">
                              {fieldState.error.message}
                            </p>
                          ) : (
                            <span className="mt-1 h-4" />
                          )}
                        </div>
                      )}
                    />
                  </div>

                  {/* AMOUNT INPUT */}
                  <div className="w-48">
                    <Controller
                      name={`allocations.${index}.amount`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatNumber(field.value)}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/[^\d]/g, '');
                            field.onChange(parseNumber(raw));
                          }}
                          placeholder="Budget Amount"
                          className="p-2 border rounded-md w-full"
                          onWheel={(e) => e.currentTarget.blur()}
                          aria-invalid={!!errors.allocations?.[index]?.amount}
                          aria-describedby={`allocations-${index}-amount-error`}
                        />
                      )}
                    />

                    {errors.allocations?.[index]?.amount?.message ? (
                      <p
                        id={`allocations-${index}-amount-error`}
                        className="mt-1 text-xs text-red-500"
                      >
                        {errors.allocations[index]!.amount!.message}
                      </p>
                    ) : (
                      <span className="mt-1 h-4 block" />
                    )}
                  </div>

                  {/* DELETE BUTTON */}
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
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-10">
            <Button
              type="button"
              onClick={() => append({ categoryId: 0, amount: 0 })}
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
            <Button className="w-32" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Budget'}
            </Button>
          </div>
        </form>

        {/* Summary Sidebar */}
        <Card className="h-fit sticky top-6">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>
              {fields.length} categor{fields.length === 1 ? 'y' : 'ies'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Budget
                </p>
                <p className="text-3xl font-bold">
                  {formatCurrency(subtotal, currency)}
                </p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  This budget will be applied to{' '}
                  <span className="font-medium">
                    {new Date(defaultMonth + '-01').toLocaleDateString(
                      'en-US',
                      {
                        month: 'long',
                        year: 'numeric',
                      },
                    )}
                  </span>
                </p>
              </div>

              {fields.length > 0 && (
                <div className="pt-4 border-t space-y-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Breakdown
                  </p>
                  {watchedAllocations?.map((allocation, idx) => {
                    const category = categories.find(
                      (c) => c.id === allocation?.categoryId,
                    );
                    if (!category || !allocation?.amount) return null;

                    return (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate mr-2">
                          {category.name}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(allocation.amount, currency)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
