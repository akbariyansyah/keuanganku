"use client";
import { useEffect, useState } from "react";
import { Transaction } from "@/types/transaction";
import { Pagination } from "@/types/pagination";



export default function TransactionPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async (page = 1, limit = 5) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transaction?page=${page}&limit=${limit}`);
      const data = await res.json();
      setTransactions(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1, 10); // default load
  }, []);

  if (loading || !pagination) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ margin: "20px" }}>
      <h1>Transactions</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #000" }}>
            <th>Amount</th>
            <th>Description</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} style={{ borderBottom: "1px solid #ccc" }}>
              <td>{t.amount}</td>
              <td>{t.description}</td>
              <td>{new Date(t.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => fetchTransactions(pagination.page - 1, pagination.limit)}
          disabled={pagination.page === 1}
        >
          Prev
        </button>
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          onClick={() => fetchTransactions(pagination.page + 1, pagination.limit)}
          disabled={pagination.page === pagination.totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
