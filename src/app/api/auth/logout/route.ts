import { cookies } from "next/headers";

export async function POST(request: Request) {
    const cookiesStore = await cookies();
    cookiesStore.set("session", "", { path: "/", maxAge: 0 });
    return Response.json({ ok: true });
}