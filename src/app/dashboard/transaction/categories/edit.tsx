'use client';

import { Button } from '@/components/ui/button';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { Input } from '@/components/ui/input';

import { Transaction, TransactionType } from '@/types/transaction';
import { updateTransaction } from '@/lib/fetcher/transaction';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectLabel,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { updateTransactionSchema } from '@/schema/schema';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    TransactionCategoryMap,
    TYPE_OPTIONS,
} from '@/constant/transaction-category';
import { toast } from 'sonner';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useUiStore } from '@/store/ui';
import { LANGUAGE_MAP } from '@/constant/language';
import { updateTransactionCategorySchema } from '@/schema/schema';

type UpdateFormFields = z.infer<typeof updateTransactionCategorySchema>;

interface ModalProps {
    showForm: boolean;
    setShowForm: (show: boolean) => void;
}

export default function EditTransactionCategory(props: ModalProps) {
    const queryClient = useQueryClient();
    const { showForm, setShowForm } =
        props;

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
                        className="grid gap-4">
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
                            <Button>
                                Save
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
