'use client';

import { useUiStore } from '@/store/ui';
import { LANGUAGE_MAP } from '@/constant/language';

export default function JournalPage() {
  const language = useUiStore((state) => state.language);
  const t = LANGUAGE_MAP[language].journal;
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{t.title}</h1>
      <p>
        {t.description}
      </p>
    </div>
  );
}
