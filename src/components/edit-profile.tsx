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
import { FormEvent } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateUser } from "@/lib/fetcher/api"
import { qk } from "@/lib/react-query/keys"
import { toast } from "sonner"


export function DialogDemo({ open, setOpen }: { open?: boolean, setOpen?: (open: boolean) => void }) {
    const profile = useMe();
    const queryClient = useQueryClient();

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
        console.log("Submitting form");
        event.preventDefault();
        if (!profile.data?.id) {
            toast.error("Unable to update profile right now.");
            return;
        }

        const formData = new FormData(event.currentTarget);
        const fullname = formData.get("fullname")?.toString().trim() ?? "";
        const username = formData.get("username")?.toString().trim() ?? "";
        const email = formData.get("email")?.toString().trim() ?? "";

        if (username.length > 20 ) {
            toast.error("Username must be less than 20 characters.");
            return
        }
        if (!fullname || !username || !email) {
            toast.error("Please fill out all fields.");
            return;
        }

        mutation.mutate({ fullname, username, email });
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
                        <Input id="fullname" name="fullname" defaultValue={profile.data?.fullname} />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="username">Username <span className="text-xs text-gray-400"></span></Label>
                        <Input id="username" name="username" defaultValue={profile.data?.username} />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="email">Email</Label>
                        <Input type="email" id="email" name="email" defaultValue={profile.data?.email} />
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
