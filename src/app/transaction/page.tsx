"use client";
import { useEffect, useState } from "react";
import { Transaction } from "@/types/transaction";
import { Pagination } from "@/types/pagination";
import { formatDate, formatRupiah } from "@/utils/formatter";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Footer from "@/components/footer";

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
    <div style={{ margin: "50px" }}>
      <Table>
        <TableCaption>A list of your recent transactions.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t, index) => (
            <TableRow key={t.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell className="font-medium">
                {formatRupiah(t.amount)}
              </TableCell>
              <TableCell>{t.description}</TableCell>
              <TableCell>{formatDate(t.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
      <Footer />
    </div>
  );
}
