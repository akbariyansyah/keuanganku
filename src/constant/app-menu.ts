import { Home, Table, DollarSignIcon, Settings } from "lucide-react";


export const sideBarList = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Expenses",
        url: "/dashboard/expenses",
        icon: Table,
    },
    {
        title: "Investment",
        url: "/dashboard/investment",
        icon: DollarSignIcon,
    },
    {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
    },
]