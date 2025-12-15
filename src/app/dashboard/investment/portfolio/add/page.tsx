'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, TrashIcon } from 'lucide-react';
import { createInvestmentSchema } from '@/schema/schema';
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
import { createInvestment, fetchCategories } from '@/lib/fetcher/api';
import { TodayDate } from '@/utils/date';
import { formatCurrency } from '@/utils/currency';
import { useUiStore } from '@/store/ui';
import { useRouter } from 'next/navigation';

const VALUE_TYPE = [
  { value: 'asset', label: 'Asset' },
  { value: 'liabilities', label: 'Liabilities' },
];

type InvestmentForm = z.infer<typeof createInvestmentSchema>;

export default function AddInvestment() {
  const router = useRouter();
  const currency = useUiStore((state) => state.currency);
  const [categories, setCategories] = React.useState<
    { id: number; name: string }[]
  >([]);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetchCategories();
        setCategories(res || []);
      } catch (err) {
        console.log('error happen when fetching categories', err);
      }
    })();
  }, []);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setValue,
  } = useForm<InvestmentForm>({
    resolver: zodResolver(createInvestmentSchema),
    mode: 'onChange',
    defaultValues: {
      date: TodayDate(),
      created_at: TodayDate(),
      total: 0,
      items: [{ type: '', category_id: 0, ticker: '', valuation: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatch({ control, name: 'items' });
  const createdAtValue = useWatch({ control, name: 'created_at' });
  const subtotal = React.useMemo(() => {
    const items = Array.isArray(watchedItems) ? watchedItems : [];
    return items.reduce((sum, i) => sum + Number(i?.valuation || 0), 0);
  }, [watchedItems]);

  React.useEffect(() => {
    if (createdAtValue) {
      setValue('date', createdAtValue, { shouldValidate: true });
    }
  }, [createdAtValue, setValue]);

  const onSubmit = async (data: InvestmentForm) => {
    const totalAmount = data.items.reduce((sum, i) => sum + i.valuation, 0);

    const request: CreateInvestmentRequest = {
      total_amount: totalAmount,
      date: data.date,
      created_at: data.created_at,
      items: data.items,
    };

    const res = await createInvestment(request);
    if (res.message) {
      router.push('/dashboard/investment/portfolio');
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold m-6">Record your investment here</h1>

      <div className="grid gap-6 md:grid-cols-[1.6fr_minmax(260px,1fr)] lg:grid-cols-[2fr_minmax(300px,1fr)] items-start">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-md w-full"
        >
          {fields.map((field, index) => (
            <div key={field.id}>
              <div className="flex flex-row gap-3 mb-4 mt-4 items-start">
                {' '}
                {/* no h-10 */}
                {/* TYPE */}
                <div className="flex-1">
                  <Controller
                    name={`items.${index}.type`}
                    control={control}
                    defaultValue={field.type ?? ''}
                    render={({ field, fieldState }) => (
                      <div className="flex flex-col">
                        <Select
                          value={field.value ?? ''}
                          onValueChange={field.onChange}
                          onOpenChange={(open) => {
                            if (!open) field.onBlur();
                          }}
                        >
                          <SelectTrigger
                            className="p-2 border rounded-md"
                            onBlur={field.onBlur}
                            aria-invalid={!!fieldState.error}
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

                        {fieldState.error ? (
                          <p className="mt-1 text-xs text-red-500">
                            {fieldState.error.message}
                          </p>
                        ) : (
                          <span className="mt-1 h-4" /> // keeps rows aligned
                        )}
                      </div>
                    )}
                  />
                </div>
                {/* CATEGORY */}
                <div className="flex-1">
                  <Controller
                    name={`items.${index}.category_id`}
                    control={control}
                    defaultValue={field.category_id ?? 0}
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
                            className="p-2 border rounded-md w-40"
                            onBlur={field.onBlur}
                            aria-invalid={!!fieldState.error}
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
                {/* TICKER */}
                <div className="w-32">
                  <input
                    {...register(`items.${index}.ticker`)}
                    placeholder="Ticker"
                    className="p-2 border rounded-md w-full"
                    aria-invalid={!!errors.items?.[index]?.ticker}
                    aria-describedby={`items-${index}-ticker-error`}
                  />
                  {errors.items?.[index]?.ticker?.message ? (
                    <p
                      id={`items-${index}-ticker-error`}
                      className="mt-1 text-xs text-red-500"
                    >
                      {errors.items[index]!.ticker!.message}
                    </p>
                  ) : (
                    <span className="mt-1 h-4 block" />
                  )}
                </div>
                {/* VALUATION */}
                <div className="w-32">
                  <input
                    type="number"
                    {...register(`items.${index}.valuation`, {
                      valueAsNumber: true,
                    })}
                    placeholder="Valuation"
                    className="p-2 border rounded-md w-full"
                    onWheel={(e) => e.currentTarget.blur()}
                    aria-invalid={!!errors.items?.[index]?.valuation}
                    aria-describedby={`items-${index}-valuation-error`}
                  />
                  {errors.items?.[index]?.valuation?.message ? (
                    <p
                      id={`items-${index}-valuation-error`}
                      className="mt-1 text-xs text-red-500"
                    >
                      {errors.items[index]!.valuation!.message}
                    </p>
                  ) : (
                    <span className="mt-1 h-4 block" />
                  )}
                </div>
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

          <div className="flex justify-between mt-10">
            <Button
              type="button"
              onClick={() =>
                append({ type: '', category_id: 0, ticker: '', valuation: 0 })
              }
            >
              <Plus /> Add Item
            </Button>
            <Button className="w-32" type="submit">
              {isSubmitting ? 'Loading...' : 'Save'}
            </Button>
          </div>
        </form>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-md h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Subtotal</h2>
            <span className="text-sm text-muted-foreground">
              {fields.length} item(s)
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold">
            {formatCurrency(subtotal, currency)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Updated live as you fill the items.
          </p>
          <div className="mt-6">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Created date (dd/mm/yyyy)
            </label>
            <input
              type="date"
              {...register('created_at')}
              className="p-2 border rounded-md w-full"
              aria-invalid={!!errors.created_at}
            />
            {errors.created_at?.message ? (
              <p className="mt-1 text-xs text-red-500">
                {errors.created_at.message}
              </p>
            ) : null}
          </div>
          <input type="hidden" {...register('date')} />
        </div>
      </div>
    </div>
  );
}
