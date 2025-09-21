import { useMe } from "@/hooks/use-me";
import { getGreeting } from "@/utils/greeting";

export default function Header() {
    const greeting :string = getGreeting();
    const { data: user } = useMe();

  return (
    <header className="w-full border-b bg-white p-4 m-5">
      <h1 className="text-2xl font-bold"> Hi {user?.fullname} , {greeting} 👋</h1>
    </header>
  );
}