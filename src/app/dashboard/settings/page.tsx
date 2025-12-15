'use client';
import { CurrencyToggle } from '@/components/currency-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import ThemeToggle from '@/components/theme-toggle';
import { LANGUAGE_MAP } from '@/constant/language';
import { useUiStore } from '@/store/ui';

export default function SettingPage() {
  const language = useUiStore((state) => state.language);
  const t = LANGUAGE_MAP[language].settings;

  return (
    <>
      <div className="m-4">
        <h1 className="text-2xl font-bold mb-4 pb-4">{t.title}</h1>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-6">
            <p className="w-40 text-lg">{t.sections.currency}</p>
            <CurrencyToggle />
          </div>
          <div className="flex items-center gap-6">
            <p className="w-40 text-lg">{t.sections.theme}</p>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-6">
            <p className="w-40 text-lg">{t.sections.language}</p>
            <LanguageToggle />
          </div>
        </div>
      </div>
    </>
  );
}
