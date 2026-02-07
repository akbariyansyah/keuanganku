'use client';

import { useUiStore } from '@/store/ui';
import { LANGUAGE_MAP } from '@/constant/language';

export default function Unauthorized() {
  const language = useUiStore((state) => state.language);
  const t = LANGUAGE_MAP[language].unauthorized;
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-6xl font-bold mb-4">{t.description}</h1>
      <p className="text-xl text-muted-foreground">{t.title}</p>
      <a href="/login">{t.goToLogin}</a>
    </div>
  );
}
