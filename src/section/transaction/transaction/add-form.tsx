import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { SelectLabel } from '@radix-ui/react-select';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { TransactionType } from '@/types/transaction';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TYPE_OPTIONS } from '@/constant/transaction-category';
import { createTransactionSchema } from '@/schema/schema';
import { TransactionCategoryMap } from '@/constant/transaction-category';
import { useEffect } from 'react';

type createRequest = z.infer<typeof createTransactionSchema>;

interface CreateTransactionModalProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  isPending: boolean;
  onSubmit: (payload: CreateTransactionRequest) => void;
  transactionCategories: TransactionCategoryMap;
}

export default function AddTransactionForm(props: CreateTransactionModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<createRequest>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: '',
      category_id: null,
      amount: 0,
      description: '',
      created_at: new Date(),
    },
  });

  useEffect(() => {
    if (props.showForm) {
      reset({
        type: '',
        category_id: null,
        amount: 0,
        description: '',
        created_at: new Date(),
      });
    }
  }, [props.showForm, reset]);
  const selectedType = useWatch({ control, name: 'type' }) as
    | TransactionType
    | '';

  const availableCategories = selectedType
    ? (props.transactionCategories[selectedType as TransactionType] ?? [])
    : [];

  const onSubmit = (data: createRequest) => {
    const payload: CreateTransactionRequest = {
      type: data.type,
      amount: data.amount,
      category_id: data.category_id ?? undefined,
      description: data.description,
      created_at: data.created_at?.toISOString(),
    };
    props.onSubmit(payload);
  };
  return (
    <div>
      <div>
        <Dialog open={props.showForm} onOpenChange={props.setShowForm}>
          <DialogTrigger asChild>
            <Button variant="default">
              <Plus /> Add Transaction
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
              <DialogDescription>
                Record your transaction here.
              </DialogDescription>
            </DialogHeader>

            {/* FORM */}
            <form
              id="txForm"
              onSubmit={handleSubmit(onSubmit)}
              className="grid gap-4"
            >
              <div className="grid gap-3">
                <Label>Type</Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
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

              <div className="grid gap-3">
                <Label>Category</Label>
                <Controller
                  control={control}
                  name="category_id"
                  render={({ field }) => (
                    <Select
                      value={field.value ? field.value.toString() : ''}
                      onValueChange={(val) => field.onChange(Number(val))}
                      disabled={
                        !selectedType || availableCategories.length === 0
                      }
                    >
                      <SelectTrigger className="p-2 border rounded-md w-95 h-10">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Category</SelectLabel>
                          {availableCategories.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id.toString()}>
                              {opt.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="grid gap-3">
                <Label>Amount</Label>
                <Input
                  type="number"
                  {...register('amount', { valueAsNumber: true })}
                  placeholder="Amount"
                />
              </div>

              <div className="grid gap-3">
                <Label>Transaction Time</Label>
                <Controller
                  control={control}
                  name="created_at"
                  render={({ field }) => {
                    const formatter = new Intl.DateTimeFormat('en-US', {
                      timeZone: 'Asia/Jakarta',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    });

                    const timeFormatter = new Intl.DateTimeFormat('en-US', {
                      timeZone: 'Asia/Jakarta',
                      hour: '2-digit',
                      minute: '2-digit',
                      hourCycle: 'h23',
                    });

                    const formattedDate = field.value
                      ? formatter.format(field.value)
                      : 'Pick a date';

                    const timeValue = field.value
                      ? timeFormatter.format(field.value)
                      : '';

                    const handleDateSelect = (day?: Date) => {
                      if (!day) {
                        field.onChange(undefined);
                        return;
                      }
                      const current = field.value ?? new Date();
                      const next = new Date(day);
                      next.setHours(
                        current.getHours(),
                        current.getMinutes(),
                        current.getSeconds(),
                        current.getMilliseconds(),
                      );
                      field.onChange(next);
                    };

                    const handleTimeChange = (value: string) => {
                      if (!value) {
                        field.onChange(undefined);
                        return;
                      }
                      const [hours, minutes] = value.split(':').map(Number);
                      const base = field.value
                        ? new Date(field.value)
                        : new Date();
                      base.setHours(hours, minutes, 0, 0);
                      field.onChange(base);
                    };

                    return (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formattedDate}
                            {field.value && (
                              <span className="ml-2 text-muted-foreground text-sm">
                                {timeValue || '00:00'}
                              </span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={handleDateSelect}
                            initialFocus
                          />
                          <div className="border-t px-3 py-2">
                            <Label className="text-xs text-muted-foreground mb-1 block">
                              Time
                            </Label>
                            <Input
                              type="time"
                              step="60"
                              value={timeValue}
                              onChange={(event) =>
                                handleTimeChange(event.target.value)
                              }
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    );
                  }}
                />
                {errors.created_at && (
                  <p className="text-sm text-destructive">
                    {errors.created_at.message}
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <Label>Description</Label>
                <Input
                  {...register('description')}
                  id="description"
                  placeholder="Buy snack..."
                />
              </div>
              <DialogFooter className='pt-4'>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" form="txForm" disabled={props.isPending}>
                  {props.isPending ? 'Creating...' : 'Create transaction'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
