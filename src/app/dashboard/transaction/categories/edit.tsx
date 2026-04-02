'use client';

import { Button } from '@/components/ui/button';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { Input } from '@/components/ui/input';

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
import { updateTransactionCategories } from '@/lib/fetcher/transaction';

type UpdateFormFields = z.infer<typeof updateTransactionCategorySchema>;

interface ModalProps {
    showForm: boolean;
    setShowForm: (show: boolean) => void;
    categoryData: Category | null;
}

export default function EditTransactionCategory(props: ModalProps) {
    const queryClient = useQueryClient();
    const { showForm, setShowForm, categoryData } =
        props;

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isDirty, isLoading },
        reset,
        setValue,
    } = useForm<UpdateFormFields>({
        resolver: zodResolver(updateTransactionCategorySchema),
    });
    const language = useUiStore((state) => state.language);
    const t = LANGUAGE_MAP[language].categories;

    useEffect(() => {
        if (!showForm) return;

        reset({
            name: categoryData?.name ?? '',
            description: categoryData?.description ?? '',
        });
    }, [showForm, categoryData, reset]);

    const mutation = useMutation({
        mutationFn: (payload: UpdateTransactionCategoryRequest) => updateTransactionCategories(categoryData!.id.toString(), payload),
        onSuccess: () => {
            toast.success('Category updated successfully');
            queryClient.invalidateQueries({ queryKey: ['transactionCategories'] });
            setShowForm(false);
        },
        onError: () => {
            toast.error('Failed to update category transaction');
        }
    })

    const onSubmit = (data: UpdateFormFields) => {
        mutation.mutate({
            name: data.name,
            description: data.description,
        })
    }

    return (
        <div>
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="mb-2">
                        <DialogTitle className="text-lg sm:text-xl">
                            {t.modal.editTitle}
                        </DialogTitle>
                    </DialogHeader>

                    <form
                        className="grid gap-4"
                        onClick={handleSubmit(onSubmit)}>
                        <div className="grid gap-3">
                            <Label>{t.name}</Label>
                            <Input
                                {...register('name')}
                                id="name"
                                placeholder={t.name}
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
                            <Button disabled={!isDirty || isLoading}>
                                {isLoading ? 'Saving...' : 'Save'}
                            </Button>
                            <DialogClose asChild>
                                <Button variant="outline">
                                    Cancel
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
