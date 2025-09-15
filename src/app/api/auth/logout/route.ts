import { cookies } from "next/headers";

export async function POST(request: Request) {
    const cookiesStore = await cookies();
    cookiesStore.delete("token");
    return Response.json({ ok: true });
}