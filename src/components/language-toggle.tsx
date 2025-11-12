"use client";

import { LANGUAGE_MAP, LANGUAGE_OPTIONS, type LanguageCode } from "@/constant/language";
import { useUiStore } from "@/store/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LanguageToggle() {
  const language = useUiStore((state) => state.language);
  const setLanguage = useUiStore((state) => state.setLanguage);
  const label = LANGUAGE_MAP[language].settings.sections.language;

  const handleChange = (next: string) => {
    setLanguage(next as LanguageCode);
  };

  return (
    <Select value={language} onValueChange={handleChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGE_OPTIONS.map(({ code, label }) => (
          <SelectItem key={code} value={code}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
