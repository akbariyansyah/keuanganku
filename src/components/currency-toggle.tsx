"use client";

import { SUPPORTED_CURRENCIES, type CurrencyCode } from "@/utils/currency";
import { useUiStore } from "@/store/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CurrencyToggle() {
  const currency = useUiStore((state) => state.currency);
  const setCurrency = useUiStore((state) => state.setCurrency);

  const handleChange = (next: string) => {
    setCurrency(next as CurrencyCode);
  };

  return (
    <Select value={currency} onValueChange={handleChange}>
      <SelectTrigger className="w-[90px]">
        <SelectValue placeholder="Currency" />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_CURRENCIES.map((code) => (
          <SelectItem key={code} value={code}>
            {code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
