'use client';

import { Button } from '@/components/ui/button';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useUiStore } from '@/store/ui';
import { LANGUAGE_MAP } from '@/constant/language';
import { updateTransactionCategorySchema } from '@/schema/schema';
import type { Category } from './page';
import { createTransactionCategories } from '@/lib/fetcher/transaction';
import { qk } from '@/lib/react-query/keys';
import { TYPE_OPTIONS } from '@/constant/transaction-category';

type UpdateFormFields = z.infer<typeof updateTransactionCategorySchema>;

interface ModalProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
}

export default function AddTransactionCategory(props: ModalProps) {
  const queryClient = useQueryClient();
  const { showForm, setShowForm } = props;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
    setValue,
  } = useForm<UpdateFormFields>({
    resolver: zodResolver(updateTransactionCategorySchema),
  });
  const language = useUiStore((state) => state.language);
  const t = LANGUAGE_MAP[language].categories;

  const mutation = useMutation({
    mutationFn: (payload: SaveTransactionCategoryRequest) =>
      createTransactionCategories(payload),
    onSuccess: () => {
      toast.success('Category created successfully');
      queryClient.invalidateQueries({ queryKey: qk.transactionCategories });
      setShowForm(false);
    },
    onError: () => {
      toast.error('Failed to create category transaction');
    },
  });

  const onSubmit = (data: UpdateFormFields) => {
    mutation.mutate({
      name: data.name,
      description: data.description,
      type: data.type,
    });
  };

  useEffect(() => {
    if (!showForm) return;

    reset({
      name: '',
      description: '',
    });
  }, [showForm, reset]);

  return (
    <div>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg sm:text-xl">
              {t.modal.addTitle}
            </DialogTitle>
          </DialogHeader>

          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-3">
              <Label>{t.name}</Label>
              <Input {...register('name')} id="name" placeholder={t.name} />
            </div>
            <div className="grid gap-3">
              <Label>{t.type}</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full h-11 sm:h-10 text-base sm:text-sm">
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
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
              <Label>{t.description}</Label>
              <Input
                {...register('description')}
                id="description"
                placeholder={t.description}
              />
            </div>
            <DialogFooter>
              <Button disabled={!isDirty}>Create</Button>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
