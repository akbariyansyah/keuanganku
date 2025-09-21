// app/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { useUiStore } from "@/store/ui";

export default function Providers({ children }: { children: ReactNode }) {
    const [client] = useState(() => new QueryClient());
    const theme = useUiStore((s) => s.theme);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
            root.style.colorScheme = "dark";
        } else {
            root.classList.remove("dark");
            root.style.colorScheme = "light";
        }
    }, [theme]);

    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
