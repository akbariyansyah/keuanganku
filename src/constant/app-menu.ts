import { Home, Table, DollarSignIcon, Settings, Wallet, TableProperties, TrendingUp, Plus, NotebookPen } from "lucide-react";
import type { SidebarLinkKey } from "./language";

type NavItem = {
    labelKey: SidebarLinkKey;
    url: string;
    icon: React.ComponentType<any>;
    children?: NavItem[];
}

const showInvestmentFeature = process.env.NEXT_PUBLIC_SHOW_INVESTMENT_FEATURE === "true";

export const sideBarList = (): NavItem[] => {
    const items: NavItem[] = [
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
            labelKey: "settings",
            url: "/dashboard/settings",
            icon: Settings,
        },
    ]

    if (showInvestmentFeature) {
        items.push({
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
        },)
    }
    return items;
}
