"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react"; 

type InvestmentItem = {
  category: string;
  ticker: string;
  value: number | "";
  valuation: number | "";
};

export default function AddInvestment() {
  const [items, setItems] = useState<InvestmentItem[]>([
    { category: "", ticker: "", value: "", valuation: "" },
  ]);
  const loading = false;

  const handleChange = (
    index: number,
    field: keyof InvestmentItem,
    value: string | number
  ) => {
    const newItems = [...items];
    // cast to number if numeric fields
    if (field === "value" || field === "valuation") {
      newItems[index][field] = value === "" ? "" : Number(value);
    } else {
      newItems[index][field] = value as string;
    }
    setItems(newItems);
  };

  const addRow = () => {
    setItems([
      ...items,
      { category: "", ticker: "", value: "", valuation: "" },
    ]);
  };

  const removeRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting", items);
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Add new investment here</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-md w-full max-w-3xl"
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-row gap-2 mb-3 items-center w-full"
          >
            <input
              placeholder="Category"
              className="p-2 border rounded-md flex-1"
              value={item.category}
              onChange={(e) =>
                handleChange(index, "category", e.target.value)
              }
            />
            <input
              placeholder="Ticker"
              className="p-2 border rounded-md w-32"
              value={item.ticker}
              onChange={(e) => handleChange(index, "ticker", e.target.value)}
            />
            <input
              placeholder="Value"
              type="number"
              className="p-2 border rounded-md w-28"
              value={item.value}
              onChange={(e) => handleChange(index, "value", e.target.value)}
            />
            <input
              placeholder="Valuation"
              type="number"
              className="p-2 border rounded-md w-32"
              value={item.valuation}
              onChange={(e) =>
                handleChange(index, "valuation", e.target.value)
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeRow(index)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <div className="flex justify-between mt-4">
          <Button type="button" onClick={addRow}>
            + Add Item
          </Button>
          <Button className="w-32" disabled={loading} type="submit">
            {loading ? "Loading..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
