import { Home, Table, DollarSignIcon, Settings, Wallet, TableProperties, TrendingUp, Plus, NotebookPen } from "lucide-react";

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
        title: "Transactions",
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
                icon: TableProperties,
            },
            {
                title: "Portfolio",
                url: "/dashboard/investment/portfolio",
                icon: Wallet,
                children: [
                    {
                        title: "Portfolio Add",
                        url: "/dashboard/investment/portfolio/add",
                        icon: Plus,
                    }
                ]
            },
            {
                title: "Performance",
                url: "/dashboard/investment/performance",
                icon: TrendingUp,
            },

        ]
    },
    {
        title: "Journal",
        url: "/dashboard/journal",
        icon: NotebookPen,
    },
    {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
    },
]