import { getGreeting } from "@/utils/greeting";

export default function Header() {
    const greeting :string = getGreeting();

  return (
    <header className="w-full border-b bg-white p-4 m-5">
      <h1 className="text-2xl font-bold">Hi, There ! </h1>
      <h3 className="mt-7"> {greeting}</h3>
    </header>
  );
}