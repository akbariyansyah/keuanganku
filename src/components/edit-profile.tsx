"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMe } from "@/hooks/use-me"
import { FormEvent, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateUser } from "@/lib/fetcher/api"
import { qk } from "@/lib/react-query/keys"
import { toast } from "sonner"


export function DialogDemo({ open, setOpen }: { open?: boolean, setOpen?: (open: boolean) => void }) {
    const profile = useMe();
    const queryClient = useQueryClient();
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<"fullname" | "username" | "email", string>>>({});

    const clearFieldError = (field: "fullname" | "username" | "email") => {
        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validateFields = (values: UpdateUserRequest) => {
        const errors: Partial<Record<"fullname" | "username" | "email", string>> = {};

        if (!values.fullname) {
            errors.fullname = "Full name is required.";
        }

        if (!values.username) {
            errors.username = "Username is required.";
        } else if (values.username.length > 20) {
            errors.username = "Username must be less than 20 characters.";
        }

        if (!values.email) {
            errors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
            errors.email = "Enter a valid email address.";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const mutation = useMutation({
        mutationFn: (payload: UpdateUserRequest) => {
            if (!profile.data?.id) {
                throw new Error("User profile is not available");
            }
            return updateUser(profile.data.id, payload);
        },
        onSuccess: () => {
            toast.success("Profile updated successfully");
            queryClient.invalidateQueries({ queryKey: qk.me });
            setFieldErrors({});
            setOpen?.(false);
        },
        onError: (error: any) => {
            const message =
                error?.response?.data?.error ||
                error?.message ||
                "Failed to update profile";
            toast.error(message);
        },
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!profile.data?.id) {
            toast.error("Unable to update profile right now.");
            return;
        }

        const formData = new FormData(event.currentTarget);
        const fullname = formData.get("fullname")?.toString().trim() ?? "";
        const username = formData.get("username")?.toString().trim() ?? "";
        const email = formData.get("email")?.toString().trim() ?? "";

        const payload = { fullname, username, email };
        if (!validateFields(payload)) {
            return;
        }

        mutation.mutate(payload);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you&apos;re
                        done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="fullname">Name</Label>
                        <Input
                            id="fullname"
                            name="fullname"
                            defaultValue={profile.data?.fullname}
                            aria-invalid={Boolean(fieldErrors.fullname)}
                            aria-describedby={fieldErrors.fullname ? "fullname-error" : undefined}
                            onChange={() => clearFieldError("fullname")}
                        />
                        {fieldErrors.fullname && (
                            <p id="fullname-error" className="text-sm text-destructive">
                                {fieldErrors.fullname}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="username">Username <span className="text-xs text-gray-400"></span></Label>
                        <Input
                            id="username"
                            name="username"
                            defaultValue={profile.data?.username}
                            aria-invalid={Boolean(fieldErrors.username)}
                            aria-describedby={fieldErrors.username ? "username-error" : undefined}
                            onChange={() => clearFieldError("username")}
                        />
                        {fieldErrors.username && (
                            <p id="username-error" className="text-sm text-destructive">
                                {fieldErrors.username}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            defaultValue={profile.data?.email}
                            aria-invalid={Boolean(fieldErrors.email)}
                            aria-describedby={fieldErrors.email ? "email-error" : undefined}
                            onChange={() => clearFieldError("email")}
                        />
                        {fieldErrors.email && (
                            <p id="email-error" className="text-sm text-destructive">
                                {fieldErrors.email}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
