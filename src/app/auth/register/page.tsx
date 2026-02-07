'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';
import { signUp } from '@/lib/fetcher/api';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { registerSchema } from '@/schema/schema';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BookType } from 'lucide-react';
import { useUiStore } from '@/store/ui';
import { LANGUAGE_MAP } from '@/constant/language';

type FormData = z.infer<typeof registerSchema>;
type ApiErrorResponse = {
  response?: { data?: { error?: string; message?: string } };
};

const extractApiError = (err: unknown, fallback: string) => {
  const apiErr = err as ApiErrorResponse | undefined;
  return (
    apiErr?.response?.data?.error ?? apiErr?.response?.data?.message ?? fallback
  );
};

export default function Register() {
  const language = useUiStore((state) => state.language);
  const t = LANGUAGE_MAP[language].auth.register;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFieldError,
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    if (data.password !== data.confirm_password) {
      const mismatchMessage = t.passwordMismatch;
      setFieldError('password', { type: 'manual', message: mismatchMessage });
      setFieldError('confirm_password', {
        type: 'manual',
        message: mismatchMessage,
      });
      setLoading(false);
      return;
    }

    try {
      const request: RegisterRequest = {
        email: data.email,
        username: data.username,
        fullname: data.fullname,
        password: data.password,
        confirm_password: data.confirm_password,
      };
      await signUp(request);

      toast.success(t.registerSuccess);

      router.replace('/auth/login');
    } catch (err: unknown) {
      const apiMsg = extractApiError(err, t.registerFailed);
      setApiError(apiMsg);
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
          src={'/register.svg'}
          alt="Register image"
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
          {apiError ? (
            <p className="text-red-500 text-sm mb-4 text-center">{apiError}</p>
          ) : null}
          <input
            {...register('fullname')}
            placeholder={t.fullName}
            className="w-full p-2 border rounded-md mb-4"
          />{' '}
          {errors.fullname && (
            <p className="text-red-500 text-sm mb-2">
              {errors.fullname?.message}
            </p>
          )}
          <input
            {...register('email')}
            placeholder={t.email}
            className="w-full p-2 border rounded-md mb-4"
          />{' '}
          {errors.email && (
            <p className="text-red-500 text-sm mb-2">{errors.email.message}</p>
          )}
          <input
            {...register('username')}
            placeholder={t.username}
            className="w-full p-2 border rounded-md mb-4"
          />
          {errors.username && (
            <p className="text-red-500 text-sm mb-2">
              {errors.username?.message}
            </p>
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
          <input
            {...register('confirm_password')}
            placeholder={t.confirmPassword}
            className="w-full p-2 border rounded-md mb-2"
            type="password"
          />
          {errors.confirm_password && (
            <p className="text-red-500 text-sm mb-2">
              {errors.confirm_password.message}
            </p>
          )}
          <Button className="w-full mt-4" disabled={loading} type="submit">
            {loading ? <Spinner className="mx-auto" /> : t.registerButton}
          </Button>
          <p className="mt-2 text-sm text-center">
            {t.haveAccount} <a href="/auth/login">{t.loginNow}</a>{' '}
          </p>
        </form>
      </div>
    </div>
  );
}
