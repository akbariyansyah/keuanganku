'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, TrashIcon } from 'lucide-react';
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
import { formatNumber, parseNumber } from '@/utils/formatter';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/shadcn-io/spinner';

const VALUE_TYPE = [
  { value: 'asset', label: 'Asset' },
  { value: 'liabilities', label: 'Liabilities' },
];

type InvestmentForm = z.infer<typeof createInvestmentSchema>;

export default function AddPortfolioSection() {
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
  const [open, setOpen] = React.useState(false);
  const [pendingData, setPendingData] = React.useState<InvestmentForm | null>(
    null,
  );
  const [saving, setSaving] = React.useState(false);

  const onSubmit = async (data: InvestmentForm) => {
    setPendingData(data);
    setOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingData) return;

    setSaving(true);

    try {
      const totalAmount = pendingData.items.reduce(
        (sum, i) => sum + Number(i.valuation || 0),
        0,
      );

      const request = {
        total_amount: totalAmount,
        date: pendingData.date,
        created_at: pendingData.created_at,
        items: pendingData.items,
      };

      const res = await createInvestment(request);
      if (res?.message === 'Investment created successfully') {
        router.push('/dashboard/investment/portfolio');
      }
    } catch (err) {
      console.error('Failed to create investment', err);
    } finally {
      setSaving(false);
      setOpen(false);
      setPendingData(null);
    }
  };

  return (
    <div className="px-2 w-full mx-auto">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogFooter className="mt-6">
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleConfirm}
                  disabled={saving}
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <Spinner /> <p>please wait</p>
                    </div>
                  ) : (
                    'yes'
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <h1 className="text-xl font-semibold mx-2 my-6">
        Record your investment here
      </h1>

      <div className="grid gap-1 md:grid-cols-[1.6fr_minmax(260px,1fr)] lg:grid-cols-[2fr_minmax(300px,1fr)] items- ">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-md w-280"
        >
          {fields.map((field, index) => (
            <div key={field.id}>
              <div className="flex flex-row gap-2 mb-4 mt-4 items-start">
                {' '}
                {/* TYPE */}
                <div className="flex-1 ">
                  <Controller
                    name={`items.${index}.type`}
                    control={control}
                    defaultValue={field.type ?? ''}
                    render={({ field, fieldState }) => (
                      <div className="flex flex-col w-40">
                        <Select
                          value={field.value ?? null}
                          onValueChange={field.onChange}
                          onOpenChange={(open) => {
                            if (!open) field.onBlur();
                          }}
                        >
                          <SelectTrigger
                            className="p-2 border rounded-md w-full"
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
                      <div className="flex flex-col w-40">
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
                            className="p-2 border rounded-md w-full"
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
                {/* Cost Basis */}
                <div className="w-55">
                  <Controller
                    name={`items.${index}.cost_basis`}
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
                        placeholder="Cost Basis"
                        className="p-2 border rounded-md w-full"
                        onWheel={(e) => e.currentTarget.blur()}
                        aria-invalid={!!errors.items?.[index]?.cost_basis}
                        aria-describedby={`items-${index}-cost_basis-error`}
                      />
                    )}
                  />

                  {errors.items?.[index]?.cost_basis?.message ? (
                    <p
                      id={`items-${index}-cost_basis-error`}
                      className="mt-1 text-xs text-red-500"
                    >
                      {errors.items[index]!.cost_basis!.message}
                    </p>
                  ) : (
                    <span className="mt-1 h-4 block" />
                  )}
                </div>
                {/* Quantity */}
                <div className="w-25">
                  <Controller
                    name={`items.${index}.quantity`}
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        step={'any'}
                        value={field.value ?? 0}
                        onChange={(e) => {
                          let raw = e.target.value;

                          // only allow numbers and dot
                          raw = raw.replace(/[^0-9.]/g, '');

                          // cannot have more than 1 dot
                          const parts = raw.split('.');
                          if (parts.length > 2) {
                            raw = `${parts[0]}.${parts.slice(1).join('')}`;
                          }

                          field.onChange(raw === '' ? '' : parseFloat(raw));
                        }}
                        placeholder="Quantity"
                        className="p-2 border rounded-md w-full"
                        onWheel={(e) => e.currentTarget.blur()}
                        aria-invalid={!!errors.items?.[index]?.quantity}
                        aria-describedby={`items-${index}-quantity-error`}
                      />
                    )}
                  />

                  {errors.items?.[index]?.quantity?.message ? (
                    <p
                      id={`items-${index}-quantity-error`}
                      className="mt-1 text-xs text-red-500"
                    >
                      {errors.items[index]!.quantity!.message}
                    </p>
                  ) : (
                    <span className="mt-1 h-4 block" />
                  )}
                </div>
                {/* CURRENT VALUATION */}
                <div className="w-55">
                  <Controller
                    name={`items.${index}.valuation`}
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
                        placeholder="Current Valuation"
                        className="p-2 border rounded-md w-full"
                        onWheel={(e) => e.currentTarget.blur()}
                        aria-invalid={!!errors.items?.[index]?.valuation}
                        aria-describedby={`items-${index}-valuation-error`}
                      />
                    )}
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
              variant="link"
              type="button"
              onClick={() =>
                append({
                  type: '',
                  category_id: 0,
                  ticker: '',
                  quantity: null,
                  cost_basis: 0,
                  valuation: 0,
                })
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
