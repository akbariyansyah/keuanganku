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


export function DialogDemo({ open, setOpen }: { open?: boolean, setOpen?: (open: boolean) => void }) {
    const profile = useMe();
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <form>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here. Click save when you&apos;re
                            done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" defaultValue={profile.data?.fullname} />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="username">Username <span className="text-xs text-gray-400">(your telegram id)</span></Label>
                            <Input id="username" name="username" defaultValue={profile.data?.username} />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="username-1">Email</Label>
                            <Input id="email" name="email" defaultValue={profile.data?.email} />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}
