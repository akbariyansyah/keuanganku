import { Home, Table, DollarSignIcon, Settings } from "lucide-react";

type NavItem = {
    title: string;
    url: string;
    icon: React.ComponentType<any>;
    children?: NavItem[];
}

export const sideBarList: NavItem[] = [
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
        children: [
            {
                title: "Categories",
                url: "/dashboard/investment/categories",
                icon: Table,
            }]
    },
    {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
    },
]