"use client";

import { useState } from "react";

import TransactionHeatmapPage from "@/components/pages/transaction-heatmap";
import ExpensesPage from "@/components/pages/transaction/transaction-table";
import TransactionAveragePage from "@/components/pages/transaction-average";

export default function TransactionPage() {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    return (
        <>
            <TransactionAveragePage />
            <TransactionHeatmapPage
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
            />
            <ExpensesPage selectedDate={selectedDate} />
        </>
    );
}
