"use client";

import { useMe } from "@/hooks/use-me";
import { getGreeting } from "@/utils/greeting";

export default function Header() {
    const greeting :string = getGreeting();
    const { data: user } = useMe();

  return (
    <header className="w-full border-b p-4 m-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hi {user?.fullname} , {greeting} 👋</h1>
        <div className="flex items-center gap-3">
        </div>
      </div>
    </header>
  );
}
