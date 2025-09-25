"use client"
import { CurrencyToggle } from "@/components/currency-toggle";
import ThemeToggle from "@/components/theme-toggle";

export default function SettingPage() {
    return <>
        <div className="m-4">
            <h1 className="text-2xl font-bold mb-4 pb-4">Settings</h1>

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-6">
                    <p className="w-40 text-lg">Currency</p>
                    <CurrencyToggle />
                </div>
                <div className="flex items-center gap-6">
                    <p className="w-40 text-lg">Theme</p>
                    <ThemeToggle />
                </div>
            </div>
        </div>



    </>
}