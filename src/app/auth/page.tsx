"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

type FormData = z.infer<typeof schema>;

export default function MyForm() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = (data: FormData) => {
        console.log("Form submitted with:", data);
        toast.success("Form submitted: " + data.email);
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-md w-full max-w-sm"
            >
                <h1 className="text-xl font-semibold mb-4">Sign in </h1>
                <input
                    {...register("email")}
                    placeholder="Email"
                    className="w-full p-2 border rounded-md mb-2"
                /> {errors.email && (
                    <p className="text-red-500 text-sm mb-2">{errors.email.message}</p>
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
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    Login
                </button>
            </form>
        </div>
    );
}
