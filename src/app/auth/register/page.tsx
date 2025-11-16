"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { signUp } from "@/lib/fetcher/api";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { registerSchema } from "@/schema/schema";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type FormData = z.infer<typeof registerSchema>;
type ApiErrorResponse = { response?: { data?: { error?: string; message?: string } } };

const extractApiError = (err: unknown, fallback: string) => {
    const apiErr = err as ApiErrorResponse | undefined;
    return apiErr?.response?.data?.error ?? apiErr?.response?.data?.message ?? fallback;
};

export default function Register() {
    const { register, handleSubmit, formState: { errors }, setError: setFieldError } = useForm<FormData>({
        resolver: zodResolver(registerSchema),
    });
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        if (data.password !== data.confirm_password) {
            const mismatchMessage = "Password and Confirm Password do not match";
            setFieldError("password", { type: "manual", message: mismatchMessage });
            setFieldError("confirm_password", { type: "manual", message: mismatchMessage });
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

            toast.success("Register successful!");

            router.replace("/auth/login");
        } catch (err: unknown) {
            const apiMsg = extractApiError(err, "Register failed");
            setApiError(apiMsg);
            toast.error(apiMsg);
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <div className="flex items-center justify-center min-h-screen">
                <div>
                    <Image
                        src={"/register.svg"}
                        alt="Register image"
                        width={350}
                        height={250}
                        className="mx-auto"
                    />
                </div>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-md w-full max-w-sm"
            >
                <h1 className="text-xl font-semibold mb-4">Create new account</h1>
                {apiError ? <p className="text-red-500 text-sm mb-4">{apiError}</p> : null}
                <input
                        {...register("fullname")}
                        placeholder="Full Name"
                        className="w-full p-2 border rounded-md mb-4"
                    /> {errors.fullname && (
                        <p className="text-red-500 text-sm mb-2">{errors.fullname?.message}</p>
                    )}
                    <input
                        {...register("email")}
                        placeholder="Email"
                        className="w-full p-2 border rounded-md mb-4"
                    /> {errors.email && (
                        <p className="text-red-500 text-sm mb-2">{errors.email.message}</p>
                    )}
                    <input
                        {...register("username")}
                        placeholder="Username"
                        className="w-full p-2 border rounded-md mb-4"
                    />
                    {errors.username && (
                        <p className="text-red-500 text-sm mb-2">{errors.username?.message}</p>
                    )}
                    <input
                        {...register("password")}
                        placeholder="Password"
                        className="w-full p-2 border rounded-md mb-2"
                        type="password"
                    />
                    {errors.password && (
                        <p className="text-red-500 text-sm mb-2">{errors.password.message}</p>
                    )}
                    <input
                        {...register("confirm_password")}
                        placeholder="Confirm Password"
                        className="w-full p-2 border rounded-md mb-2"
                        type="password"
                    />
                    {errors.confirm_password && (
                        <p className="text-red-500 text-sm mb-2">{errors.confirm_password.message}</p>
                    )}
                    <Button className="w-full mt-4" disabled={loading} type="submit">

                        {loading ? <Spinner className="mx-auto" /> : "Register"}
                    </Button>
                    <p className="mt-2 text-sm">Already have an account ? <a href="/auth/login">Login Now</a> </p>
                </form>
            </div>
        </>
    )
}
