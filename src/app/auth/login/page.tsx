'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { login } from '@/lib/fetcher/api';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { loginSchema } from '@/schema/schema';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BookType } from 'lucide-react';
import { useUiStore } from '@/store/ui';
import { LANGUAGE_MAP } from '@/constant/language';

type FormData = z.infer<typeof loginSchema>;
type ApiErrorResponse = {
  response?: { data?: { error?: string; message?: string } };
};

const extractApiError = (err: unknown, fallback: string) => {
  const apiErr = err as ApiErrorResponse | undefined;
  return (
    apiErr?.response?.data?.error ?? apiErr?.response?.data?.message ?? fallback
  );
};

export default function MyForm() {
  const language = useUiStore((state) => state.language);
  const t = LANGUAGE_MAP[language].auth.login;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  });
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await login({ email: data.email, password: data.password });

      // Clear all cached data from previous user session
      queryClient.clear();

      toast.success(t.loginSuccess);

      router.replace('/dashboard');
    } catch (err: unknown) {
      const apiMsg = extractApiError(err, t.loginFailed);
      setError(apiMsg);
      toast.error(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="flex items-center justify-center gap-2 text-2xl font-semibold italic text-center">
        <BookType className="size-5 text-foreground" fill="grey" />
        <span>Keuanganku</span>
      </div>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-10">
        <Image
          src={'/login.svg'}
          alt="login image"
          width={350}
          height={250}
          className="mx-auto"
        />
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-md w-full max-w-sm"
        >
          <h1 className="text-xl font-semibold mb-4 text-center">
            {t.title}
          </h1>
          {error ? (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          ) : null}
          <input
            {...register('email')}
            placeholder={t.email}
            className="w-full p-2 border rounded-md mb-4"
          />{' '}
          {errors.email && (
            <p className="text-red-500 text-sm mb-2">{errors.email.message}</p>
          )}
          <input
            {...register('password')}
            placeholder={t.password}
            className="w-full p-2 border rounded-md mb-2"
            type="password"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mb-2">
              {errors.password.message}
            </p>
          )}
          <Button className="w-full mt-4" disabled={loading} type="submit">
            {loading ? <Spinner className="mx-auto" /> : t.loginButton}
          </Button>
          <p className="mt-2 text-sm text-center">
            {t.noAccount} <a href="/auth/register">{t.createNow}</a>{' '}
          </p>
        </form>
      </div>
    </div>
  );
}
