'use client';
import { formatNumber, parseNumber } from '@/utils/formatter';
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
import { Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createGainInvestment } from '@/schema/schema';
import z from 'zod';
import { Input } from '@/components/ui/input';

type createRequest = z.infer<typeof createGainInvestment>;
interface RealizeGainFormProps {
  showForm: boolean;
  setShowForm: (val: boolean) => void;
}
export function RealizeGainForm({
  showForm,
  setShowForm,
}: RealizeGainFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<createRequest>({
    resolver: zodResolver(createGainInvestment),
    defaultValues: {
      type: '',
      category_id: null,
      amount: 0,
      description: '',
    },
  });

  const onSubmit = (data: createRequest) => {};
  return (
    <>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            className="h-10 sm:h-9 px-3 sm:px-4 text-sm"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Realize Gain</span>
            <span className="sm:hidden ml-2">Add</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Realize you gain/loss from your investment
            </DialogTitle>
            <DialogDescription className="text-sm">
              Fill the form below to record your investment transaction. This
              will help you track your performance more accurately. You can add
              both buy and sell transactions.
            </DialogDescription>
          </DialogHeader>

          {/* FORM */}
          <form
            id="txForm"
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-3 sm:gap-4"
          >
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Amount</Label>
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <Input
                    type="text"
                    value={formatNumber(field.value)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^\d]/g, '');
                      field.onChange(parseNumber(raw));
                    }}
                    // {...register('amount', { valueAsNumber: true })}
                    placeholder="Amount"
                    className="h-11 sm:h-10 text-base sm:text-sm"
                    inputMode="numeric"
                  />
                )}
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-medium">Transaction date</Label>
            </div>

            <DialogFooter className="pt-3 sm:pt-4 flex-col sm:flex-row sm:gap-0">
              <Button
                type="submit"
                form="txForm"
                className="w-full sm:w-auto h-11 sm:h-10 text-sm mx-4"
              >
                Create
              </Button>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto h-11 sm:h-10 text-sm"
                >
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
