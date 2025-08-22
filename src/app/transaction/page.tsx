"use client";
import { useEffect, useState } from "react";
import { Transaction } from "@/types/transaction";

export default function TransactionPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        fetch("/api/transaction")
            .then((res) => res.json())
            .then((data: { data: Transaction[] }) => {
                setTransactions(data.data);
            })
            .catch((error) => {
                console.error("Error fetching transactions:", error);
            });
    }, []);

    if (transactions.length === 0) {
        return <p>Loading...</p>;
    }

    return (
        <div style={{ margin: "20px" }}>
            <h1>Transactions</h1>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                    {transactions.map((t) => (
                        <tr key={t.id} style={{ borderBottom: "1px solid #ccc" }}>
                            <td>{t.amount}</td>
                            <td>{t.description}</td>
                            <td>{t.created_at}</td>
                        </tr>
                    ))}
                </tbody>

            </table>
        </div>
    );
}
