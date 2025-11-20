"use client";

import { useState } from "react";

import TransactionHeatmapPage from "@/components/pages/transaction-heatmap";
import ExpensesPage from "@/components/pages/transaction/transaction-table";

export default function TransactionPage() {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    return (
        <>
            <TransactionHeatmapPage
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
            />
            <ExpensesPage selectedDate={selectedDate} />
        </>
    );
}
