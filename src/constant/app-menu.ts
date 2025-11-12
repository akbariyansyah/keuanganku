import { Home, Table, DollarSignIcon, Settings, Wallet, TableProperties, TrendingUp, Plus, NotebookPen } from "lucide-react";
import type { SidebarLinkKey } from "./language";

type NavItem = {
    labelKey: SidebarLinkKey;
    url: string;
    icon: React.ComponentType<any>;
    children?: NavItem[];
}

export const sideBarList: NavItem[] = [
    {
        labelKey: "dashboard",
        url: "/dashboard",
        icon: Home,
    },
    {
        labelKey: "transactions",
        url: "/dashboard/transaction",
        icon: Table,
    },
    {
        labelKey: "investment",
        url: "/dashboard/investment",
        icon: DollarSignIcon,
        children: [
            {
                labelKey: "investmentCategories",
                url: "/dashboard/investment/categories",
                icon: TableProperties,
            },
            {
                labelKey: "investmentPortfolio",
                url: "/dashboard/investment/portfolio",
                icon: Wallet,
                children: [
                    {
                        labelKey: "investmentPortfolioAdd",
                        url: "/dashboard/investment/portfolio/add",
                        icon: Plus,
                    }
                ]
            },
            {
                labelKey: "investmentPerformance",
                url: "/dashboard/investment/performance",
                icon: TrendingUp,
            },

        ]
    },
    {
        labelKey: "journal",
        url: "/dashboard/journal",
        icon: NotebookPen,
    },
    {
        labelKey: "settings",
        url: "/dashboard/settings",
        icon: Settings,
    },
]
