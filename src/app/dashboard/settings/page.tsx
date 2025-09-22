"use client"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@/components/ui/select";

export default function SettingPage() {
    return <>
        <div className="m-4">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <div className="flex flex-row gap-4 max-w-sm">
                <p className="text-l mt-1">Currency </p>
                <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a Currency" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Currency</SelectLabel>
                            <SelectItem value="idr">IDR</SelectItem>
                            <SelectItem value="usd">USD</SelectItem>

                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </div>

    </>
}